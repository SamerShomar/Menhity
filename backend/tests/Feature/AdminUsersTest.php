<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUsersTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_user_stats_count_recently_seen_accounts(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $recentUser = User::factory()->create();
        $staleUser = User::factory()->create();
        $recentUser->forceFill(['last_seen_at' => now()->subMinute()])->save();
        $staleUser->forceFill(['last_seen_at' => now()->subMinutes(10)])->save();

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/users')
            ->assertOk()
            ->assertJsonPath('meta.stats.online', 2);
    }

    public function test_admin_user_stats_never_report_zero_online_users(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Admin]);
        $staleUser = User::factory()->create();
        $staleUser->forceFill(['last_seen_at' => now()->subMinutes(10)])->save();

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/users')
            ->assertOk()
            ->assertJsonPath('meta.stats.online', 1);

        $this->assertNotNull($admin->fresh()->last_seen_at);
    }
}