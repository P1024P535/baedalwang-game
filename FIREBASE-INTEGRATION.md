# Firebase account/cloud adapter 1.0.3

Original 495 game files are byte-for-byte preserved. The WebView file URL, package and save key remain unchanged. Native SDKs implement only the existing account/cloud callbacks. Public app identifiers were read from the owner's Firebase console; no service account or OAuth client secret is embedded.

Google provider enabled in project `baedalwang-game`. Android app ID: `1:679371652571:android:f70e949bf09c405ec13bfe`. Credential Manager uses the project's public web OAuth client ID.

Cloud uploads require a successful server read for the same Google UID. Guest and other-account local saves cannot upload. Failed reads block uploads; writes use a revision transaction and stop on conflict. Original restore comparison remains intact. No save migration, deletion, or graphics/economy changes.

Pending: Firestore creation/rules activation, Play app-signing SHA certificate registration, real-device Google login/cancel/logout/restart and two-device cloud/conflict verification. Ranking and real billing remain pending; this build retains the original test shop, which charges no money. Do not describe it as a completed production release.
