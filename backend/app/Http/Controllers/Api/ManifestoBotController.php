<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

/**
 * Public manifesto Q&A bot.
 *
 * Knowledge is built on every request from live SiteSetting rows, so when
 * admins update manifesto / vision / biography in Content, answers change
 * immediately — no redeploy required.
 */
class ManifestoBotController extends Controller
{
    use ApiResponse;

    private const STOP = [
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'shall', 'can', 'of', 'in', 'on',
        'at', 'to', 'for', 'from', 'by', 'with', 'about', 'as', 'into',
        'through', 'during', 'before', 'after', 'above', 'below', 'between',
        'and', 'but', 'or', 'nor', 'not', 'no', 'yes', 'what', 'which', 'who',
        'whom', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our',
        'you', 'your', 'he', 'she', 'it', 'they', 'them', 'their', 'how',
        'when', 'where', 'why', 'tell', 'please', 'explain', 'describe',
        'give', 'list', 'show', 'say', 'know', 'need', 'want',
    ];

    public function ask(Request $request)
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'min:2', 'max:500'],
        ]);

        $question = trim($validated['question']);
        $chunks = $this->buildKnowledge();
        $answer = $this->answer($question, $chunks);

        return $this->success([
            'answer' => $answer['text'],
            'sources' => $answer['sources'],
            'matched' => $answer['matched'],
            'knowledge_updated_at' => now()->toIso8601String(),
            'chunk_count' => count($chunks),
        ]);
    }

    /**
     * Expose the current knowledge snapshot (useful for debugging / admin).
     */
    public function knowledge()
    {
        $chunks = $this->buildKnowledge();

        return $this->success([
            'chunks' => $chunks,
            'count' => count($chunks),
            'updated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Pull latest manifesto + related content groups from the DB.
     *
     * @return list<array{id:string,title:string,body:string,tags:string[]}>
     */
    private function buildKnowledge(): array
    {
        $chunks = [];

        $manifesto = SiteSetting::map('content_manifesto');
        $intro = trim((string) ($manifesto['manifesto_intro'] ?? ''));
        if ($intro !== '') {
            $chunks[] = [
                'id' => 'manifesto_intro',
                'title' => 'Manifesto overview',
                'body' => $intro,
                'tags' => ['manifesto', 'overview', 'commitment', 'promise', 'plan', 'agenda'],
            ];
        }

        $pillarsJson = $manifesto['manifesto_pillars_json'] ?? '[]';
        $pillars = json_decode($pillarsJson, true);
        if (is_array($pillars)) {
            foreach ($pillars as $i => $pillar) {
                $title = trim((string) ($pillar['title'] ?? ''));
                $body = trim((string) ($pillar['body'] ?? ''));
                if ($title === '' && $body === '') {
                    continue;
                }
                $chunks[] = [
                    'id' => 'pillar_'.$i,
                    'title' => $title !== '' ? $title : 'Manifesto pillar '.($i + 1),
                    'body' => $body,
                    'tags' => $this->tokens($title.' '.$body),
                ];
            }
        }

        // Fallback pillars if admin has not saved content yet
        if (count(array_filter($chunks, fn ($c) => str_starts_with($c['id'], 'pillar_'))) === 0) {
            foreach ($this->defaultPillars() as $i => $p) {
                $chunks[] = [
                    'id' => 'pillar_default_'.$i,
                    'title' => $p['title'],
                    'body' => $p['body'],
                    'tags' => $this->tokens($p['title'].' '.$p['body']),
                ];
            }
        }

        if ($intro === '') {
            $chunks[] = [
                'id' => 'manifesto_intro_default',
                'title' => 'Manifesto overview',
                'body' => 'This manifesto is a working commitment, not a slogan — each pillar maps directly to tracked programmes on this platform.',
                'tags' => ['manifesto', 'overview', 'commitment'],
            ];
        }

        $vm = SiteSetting::map('content_vision_mission');
        if (! empty($vm['vision_text'])) {
            $chunks[] = [
                'id' => 'vision',
                'title' => 'Vision',
                'body' => trim((string) $vm['vision_text']),
                'tags' => ['vision', 'future', 'goal', 'long-term', 'aspiration'],
            ];
        }
        if (! empty($vm['mission_text'])) {
            $chunks[] = [
                'id' => 'mission',
                'title' => 'Mission',
                'body' => trim((string) $vm['mission_text']),
                'tags' => ['mission', 'purpose', 'serve', 'duty', 'office'],
            ];
        }

        $bio = SiteSetting::map('content_biography');
        if (! empty($bio['biography_intro'])) {
            $chunks[] = [
                'id' => 'biography',
                'title' => 'Biography',
                'body' => trim((string) $bio['biography_intro']),
                'tags' => ['biography', 'background', 'who', 'about', 'profile', 'lucky', 'eseigbe'],
            ];
        }
        $milestonesJson = $bio['biography_milestones_json'] ?? null;
        if ($milestonesJson) {
            $milestones = json_decode($milestonesJson, true);
            if (is_array($milestones)) {
                foreach ($milestones as $i => $m) {
                    $t = trim((string) ($m['title'] ?? $m['label'] ?? ''));
                    $b = trim((string) ($m['body'] ?? $m['text'] ?? ''));
                    if ($t === '' && $b === '') {
                        continue;
                    }
                    $chunks[] = [
                        'id' => 'milestone_'.$i,
                        'title' => $t !== '' ? $t : 'Milestone',
                        'body' => $b,
                        'tags' => ['biography', 'milestone', 'career', 'history'],
                    ];
                }
            }
        }

        $profile = SiteSetting::map('content_political_profile');
        foreach (['political_summary', 'political_profile_text', 'profile_summary'] as $key) {
            if (! empty($profile[$key])) {
                $chunks[] = [
                    'id' => 'political_profile',
                    'title' => 'Political profile',
                    'body' => trim((string) $profile[$key]),
                    'tags' => ['politics', 'political', 'party', 'office', 'representation'],
                ];
                break;
            }
        }

        return $chunks;
    }

    private function answer(string $question, array $chunks): array
    {
        $q = mb_strtolower($question);
        $qTokens = $this->tokens($q);

        // Greetings
        if (preg_match('/^(hi|hello|hey|good\s+(morning|afternoon|evening)|greetings)\b/i', $question)) {
            return [
                'text' => "Hello! I'm the manifesto assistant for Hon. Barr. Lucky Eseigbe. Ask me about any pillar of the manifesto, the vision & mission, or his background — answers always reflect the latest published content.",
                'sources' => [],
                'matched' => false,
            ];
        }

        // List all pillars
        if (preg_match('/\b(pillars?|all\s+pillars|list\s+(the\s+)?pillars|what\s+are\s+the\s+pillars|manifesto\s+points|agenda)\b/i', $question)) {
            $pillars = array_values(array_filter($chunks, fn ($c) => str_contains($c['id'], 'pillar')));
            if ($pillars) {
                $lines = [];
                foreach ($pillars as $i => $p) {
                    $lines[] = ($i + 1).'. **'.$p['title'].'** — '.$p['body'];
                }

                return [
                    'text' => "Here are the current manifesto pillars:\n\n".implode("\n\n", $lines),
                    'sources' => array_column($pillars, 'title'),
                    'matched' => true,
                ];
            }
        }

        // Score chunks
        $scored = [];
        foreach ($chunks as $chunk) {
            $score = $this->score($qTokens, $q, $chunk);
            if ($score > 0) {
                $scored[] = ['score' => $score, 'chunk' => $chunk];
            }
        }
        usort($scored, fn ($a, $b) => $b['score'] <=> $a['score']);

        if ($scored === [] || $scored[0]['score'] < 2) {
            $pillarTitles = array_values(array_map(
                fn ($c) => $c['title'],
                array_filter($chunks, fn ($c) => str_contains($c['id'], 'pillar'))
            ));

            return [
                'text' => "I couldn't find a direct match in the current manifesto. Try asking about a specific pillar"
                    .($pillarTitles ? ' such as: '.implode(', ', array_slice($pillarTitles, 0, 4)) : '')
                    .'. You can also ask about vision, mission, or biography. Content updates automatically when the manifesto is edited in Admin → Content.',
                'sources' => [],
                'matched' => false,
            ];
        }

        $top = array_slice($scored, 0, 3);
        $best = $top[0]['chunk'];
        $parts = ['**'.$best['title'].'**', $best['body']];

        // Add a related second chunk if close in score
        if (isset($top[1]) && $top[1]['score'] >= max(2, $top[0]['score'] * 0.6)) {
            $rel = $top[1]['chunk'];
            if ($rel['id'] !== $best['id']) {
                $parts[] = "\nRelated — **{$rel['title']}**: {$rel['body']}";
            }
        }

        return [
            'text' => implode("\n\n", $parts),
            'sources' => array_values(array_unique(array_map(fn ($t) => $t['chunk']['title'], $top))),
            'matched' => true,
        ];
    }

    private function score(array $qTokens, string $qRaw, array $chunk): float
    {
        $score = 0.0;
        $titleLower = mb_strtolower($chunk['title']);
        $bodyLower = mb_strtolower($chunk['body']);
        $hay = $titleLower.' '.$bodyLower.' '.implode(' ', $chunk['tags']);

        foreach ($qTokens as $tok) {
            if (str_contains($titleLower, $tok)) {
                $score += 4;
            } elseif (in_array($tok, $chunk['tags'], true)) {
                $score += 3;
            } elseif (str_contains($bodyLower, $tok)) {
                $score += 2;
            } elseif (str_contains($hay, $tok)) {
                $score += 1;
            }
        }

        // Phrase boost: full title contained in question
        if ($titleLower !== '' && str_contains($qRaw, $titleLower)) {
            $score += 8;
        }

        return $score;
    }

    /** @return list<string> */
    private function tokens(string $text): array
    {
        $text = mb_strtolower($text);
        $text = preg_replace('/[^a-z0-9\s\-]/u', ' ', $text) ?? $text;
        $parts = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $out = [];
        foreach ($parts as $p) {
            $p = trim($p, '-');
            if (strlen($p) < 3) {
                continue;
            }
            if (in_array($p, self::STOP, true)) {
                continue;
            }
            $out[] = $p;
        }

        return array_values(array_unique($out));
    }

    /** @return list<array{title:string,body:string}> */
    private function defaultPillars(): array
    {
        return [
            [
                'title' => 'Infrastructure & Roads',
                'body' => 'A phased, transparent rehabilitation of failed roads and drainage across every ward, with contractor accountability tracked publicly through the Constituency Project Tracker.',
            ],
            [
                'title' => 'Education & Youth Development',
                'body' => 'Expanded scholarship coverage through the Lucky Eseigbe Foundation, skills-acquisition centres, and a direct pipeline from vocational training to local employment.',
            ],
            [
                'title' => 'Healthcare Access',
                'body' => 'Regular medical outreach programs and support for primary healthcare centres in underserved communities, with beneficiary outcomes reported openly.',
            ],
            [
                'title' => 'Transparent Governance',
                'body' => 'Every constituency project, every donation, and every election result on this platform is logged and auditable — governance as an open ledger, not a closed office.',
            ],
            [
                'title' => 'Economic Empowerment',
                'body' => 'Grants and micro-enterprise support for artisans, traders, and cooperatives, coordinated through ward-level empowerment programs.',
            ],
        ];
    }
}
