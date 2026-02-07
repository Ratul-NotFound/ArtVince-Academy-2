/**
 * Cache Invalidation Helpers
 * Use these to clear cache when admin makes updates
 */

import { clearCacheByPrefix, clearCache } from "./cache";

// Clear all course-related cache
export function invalidateCourseCache() {
    clearCacheByPrefix("courses");
    clearCache("courses_grid_home");
}

// Clear all trainer/mentor cache
export function invalidateTrainerCache() {
    clearCacheByPrefix("mentors");
    clearCache("mentors_showcase");
}

// Clear enrollment-related cache
export function invalidateEnrollmentCache() {
    clearCacheByPrefix("enrollment");
    clearCache("enrollment_counts");
}

// Clear stats cache (used in AboutSection)
export function invalidateStatsCache() {
    clearCache("about_section_stats");
}

// Clear showcase cache
export function invalidateShowcaseCache() {
    clearCacheByPrefix("showcase");
}

// Clear all caches (nuclear option)
export { clearAllCache } from "./cache";
