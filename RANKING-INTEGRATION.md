# 1.0.4 internal-test leaderboard

The existing game and 495 original files remain unchanged. A native adapter implements the game's ranking callbacks after a successful Google account/cloud-load flow. Guests cannot publish. All-time and weekly top-50 queries and capped (1000) rank counts use Firestore, with no composite index requirement. Account deletion removes the player's all-time and paginated weekly entries and blocks stale tokens using a deletion marker.

Only nickname and gameplay statistics enter leaderboard documents. Email and serialized private save data remain in owner-only `/users/{uid}` records. Rules reject unauthenticated/anonymous/cross-owner writes, unknown fields, invalid values, unbounded queries and rapid updates. Published scores are client submitted beta scores; this is not an authoritative anti-cheat system and must not be described as one or used for monetary/prize decisions.

The native adapter disables unconfigured purchase callbacks and purchase buttons. Existing saved items remain intact. Merchant account setup and a verified billing backend are still required; no payment is attempted.

Cloud rules allow 1.0.3 and 1.0.4 for backward compatibility. Internal 1.0.4 uses official Google test ads. Physical Google login, two-device cloud restoration, ranking display and account deletion require actual-phone verification before production release.

A minimal UID-based deletion marker is retained solely to block stale Firebase tokens and prevent old devices from recreating deleted saves. It contains no email, nickname or score. This retention must be reflected in the release privacy policy. Interrupted deletion is retryable; local save cleanup is bound to the deleted UID and rechecked at page load.
