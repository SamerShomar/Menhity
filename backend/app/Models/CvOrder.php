<?php

namespace App\Models;

use App\Enums\CvOrderStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CvOrder extends Model
{
    protected $fillable = [
        'order_number',
        'user_id',
        'expert_id',
        'status',
        'current_step',
        'data_snapshot',
        'ats_score',
        'expected_delivery_at',
        'submitted_at',
        'delivered_at',
        'final_file_path',
    ];

    protected function casts(): array
    {
        return [
            'status' => CvOrderStatus::class,
            'data_snapshot' => 'array',
            'current_step' => 'integer',
            'ats_score' => 'integer',
            'expected_delivery_at' => 'datetime',
            'submitted_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function expert(): BelongsTo
    {
        return $this->belongsTo(User::class, 'expert_id');
    }

    public function timeline(): HasMany
    {
        return $this->hasMany(CvOrderEvent::class)->orderBy('sort_order');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(CvOrderNote::class)->latest();
    }

    public function atsChecks(): HasMany
    {
        return $this->hasMany(CvAtsCheck::class)->orderBy('sort_order');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', CvOrderStatus::active());
    }

    /** MNH-CV-8921 */
    public static function generateOrderNumber(): string
    {
        do {
            $number = 'MNH-CV-'.random_int(1000, 9999);
        } while (static::where('order_number', $number)->exists());

        return $number;
    }
}
