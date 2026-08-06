<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Fired when results are verified or critical incidents are reported.
 * Connect Laravel Reverb / Pusher / Ably — frontend listens on "situation-room".
 */
class SituationRoomUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $type, // result.verified | incident.critical | result.submitted
        public array $payload = [],
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('situation-room')];
    }

    public function broadcastAs(): string
    {
        return 'situation.updated';
    }
}
