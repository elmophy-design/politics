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
                // Four Pillars section (homepage cards under the hero)
                'pillars_section_eyebrow' => 'Four Pillars',
                'pillars_section_headline' => 'One office, four commitments to the constituency.',
                'pillar_constituency_title' => 'Constituency Projects',
                'pillar_constituency_description' => 'Every road, borehole, and classroom funded through this office, tracked by ward with real progress photos.',
                'pillar_constituency_image' => '',
                'pillar_constituency_href' => '/constituency-projects',
                'pillar_foundation_title' => 'Lucky Eseigbe Foundation',
                'pillar_foundation_description' => 'Scholarships, medical outreach, and empowerment programs reaching communities beyond the campaign cycle.',
                'pillar_foundation_image' => '',
                'pillar_foundation_href' => '/foundation',
                'pillar_election_title' => 'Election Situation Room',
                'pillar_election_description' => 'Ward-by-ward result collation and accredited polling agents, built for transparency on election day.',
                'pillar_election_image' => '',
                'pillar_election_href' => '/about/political-profile',
                'pillar_engagement_title' => 'Citizen Engagement',
                'pillar_engagement_description' => 'Report an issue, request assistance, or send a suggestion directly — and track how it\'s resolved.',
                'pillar_engagement_image' => '',
                'pillar_engagement_href' => '/contact',

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

            'content_constituency' => [
                'constituency_page_eyebrow' => 'Transparency Tracker',
                'constituency_page_title' => 'Constituency Projects',
                'constituency_page_intro' => 'Every road, borehole, and classroom funded through this office — tracked by ward, with real progress.',
            ],
            'content_foundation' => [
                'foundation_page_eyebrow' => 'Lucky Eseigbe Foundation',
                'foundation_page_title' => 'Impact beyond the campaign cycle.',
                'foundation_page_intro' => 'The Foundation exists to serve the constituency between election cycles — scholarships, medical outreach, and empowerment programs delivered directly to the communities that need them.',
            ],
            'content_contact' => [
                'contact_page_eyebrow' => 'Get in Touch',
                'contact_page_title' => 'Reach the constituency office',
                'contact_page_intro' => 'Report an issue, raise a complaint, or send a suggestion — every submission is logged and routed to the right ward coordinator.',
                'contact_office_address' => 'Address to be confirmed',
                'contact_office_phone' => 'To be confirmed',
                'contact_office_email' => 'contact@luckyeseigbe.org',
            ],

        ];

        foreach ($defaults as $group => $settings) {
            foreach ($settings as $key => $value) {
                SiteSetting::firstOrCreate(['key' => $key], ['value' => $value, 'group' => $group]);
            }
        }
    }
}
