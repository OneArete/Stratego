# Advisor Memory Specification v1

Each record contains: advisor identity, experience count, confidence, understanding coverage, bounded practice weights, timestamp and learning notes. Learning is triggered only by an explicit post-practice reflection. Weight deltas are clamped to ±0.28. Confidence is clamped to 22–94%. Coverage is clamped to 18–96%.
