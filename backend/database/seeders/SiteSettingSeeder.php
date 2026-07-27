<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'homepage' => [
                'home_hero_eyebrow' => 'Constituency Representative · Barrister · Public Servant',
                'home_hero_headline' => 'A voice for every ward,',
                'home_hero_headline_highlight' => 'a record you can verify.',
                'home_hero_quote' => 'Governance is not a promise made once every four years — it is a ledger, open to the people who gave you their vote.',
                'home_hero_background_image' => '',
            ],
            'footer' => [
                'social_facebook_url' => '',
                'social_twitter_url' => '',
                'social_instagram_url' => '',
                'social_youtube_url' => '',
            ],
            'payments' => [
                'payment_paystack_enabled' => 'true',
                'payment_flutterwave_enabled' => 'true',
            ],
            'theme' => [
                // Overrides the compiled CSS variables at runtime — see ThemeProvider.
                'theme_color_primary' => '#0a3620',
                'theme_color_action' => '#158a42',
                'theme_color_gold' => '#c9a227',
            ],
            'identity' => [
                'site_name' => 'Hon. Barr. Lucky Eseigbe',
                'site_tagline' => 'Serving the constituency with integrity, transparency, and action.',
                'site_logo_image' => '',
            ],
            'content_manifesto' => [
                'manifesto_intro' => 'This manifesto is a working commitment, not a slogan — each pillar below maps directly to a module on this platform where progress is tracked and reported.',
                'manifesto_pillars_json' => json_encode([
                    ['title' => 'Infrastructure & Roads', 'body' => 'A phased, transparent rehabilitation of failed roads and drainage across every ward, with contractor accountability tracked publicly through the Constituency Project Tracker.'],
                    ['title' => 'Education & Youth Development', 'body' => 'Expanded scholarship coverage through the Lucky Eseigbe Foundation, skills-acquisition centres, and a direct pipeline from vocational training to local employment.'],
                    ['title' => 'Healthcare Access', 'body' => 'Regular medical outreach programs and support for primary healthcare centres in underserved communities, with beneficiary outcomes reported openly.'],
                    ['title' => 'Transparent Governance', 'body' => 'Every constituency project, every donation, and every election result on this platform is logged and auditable — governance as an open ledger, not a closed office.'],
                    ['title' => 'Economic Empowerment', 'body' => 'Grants and micro-enterprise support for artisans, traders, and cooperatives, coordinated through ward-level empowerment programs.'],
                ]),
            ],
            'content_vision_mission' => [
                'vision_text' => 'A constituency where every citizen has a direct line to the office that represents them, and every naira spent on their behalf is visible and accounted for.',
                'mission_text' => 'To deliver responsive, transparent representation — bridging campaign promises and governance action through a platform that tracks both.',
            ],
            'content_political_profile' => [
                'political_profile_body' => 'This is placeholder political profile copy. Replace with a full account of political career milestones, committee memberships, legislative priorities, and public positions.',
                'political_profile_roles_json' => json_encode([
                    ['period' => '—', 'role' => 'Current elected office — replace with confirmed title and constituency.'],
                    ['period' => '—', 'role' => 'Prior political or public service roles.'],
                    ['period' => '—', 'role' => 'Party positions held, if any.'],
                ]),
            ],
            'content_biography' => [
                'biography_intro' => 'This is placeholder biographical copy. Replace with a full account of education, legal career, public service milestones, and the values that shape this office\'s approach to representation.',
                'biography_portrait_image' => '',
                'biography_timeline_json' => json_encode([
                    ['year' => '—', 'event' => 'Early life and education — replace with confirmed biographical details.'],
                    ['year' => '—', 'event' => 'Called to the Nigerian Bar — legal career highlights.'],
                    ['year' => '—', 'event' => 'Entry into public service and community advocacy.'],
                    ['year' => '—', 'event' => 'Founding of the Lucky Eseigbe Foundation.'],
                    ['year' => '—', 'event' => 'Election to current office.'],
                ]),
            ],
        ];

        foreach ($defaults as $group => $settings) {
            foreach ($settings as $key => $value) {
                SiteSetting::firstOrCreate(['key' => $key], ['value' => $value, 'group' => $group]);
            }
        }
    }
}
