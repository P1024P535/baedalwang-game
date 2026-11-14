# baedalwang-game

## Android build and Play internal testing

The GitHub Actions workflow is at `.github/workflows/android-test-apk.yml`. It builds a debug APK for device testing and an unsigned release AAB.

### Release signing (required before Play Console upload)

Create a **new upload keystore only if an existing upload key has not already been registered with Google Play**. Keep the keystore and passwords private and backed up. Never commit them to this repository.

Configure these four repository **Actions secrets** in GitHub Settings → Secrets and variables → Actions:

- `BAEDALWANG_KEYSTORE_BASE64`: base64 of the upload keystore (.jks) as a single line.
- `BAEDALWANG_KEY_ALIAS`: alias of the upload key.
- `BAEDALWANG_STORE_PASSWORD`: keystore password.
- `BAEDALWANG_KEY_PASSWORD`: key password.

Once all four secrets are configured, trigger the **Build Baedalwang Test APK** workflow. Confirm that the **Sign release AAB when signing secrets are configured** step succeeded and download the `baedalwang-signed-release-aab` artifact. The unsigned AAB is **not** suitable for Play submission.

Before internal testing, verify the package ID `com.ssokcompany.baedalwang`, versionCode, Play Console app record, signing certificate, and target API requirements. Test the debug APK on a real Android device, including offline startup and language/layout behavior. Uploading to Play Console and enrolling testers are separate steps; a successful CI build does not perform either.

**Important:** Do not replace an existing Play upload key without following Google's upload-key reset process. Do not share signing secrets in chat or issues.

### Android phone only (no PC)

On an Android phone, use the official Termux distribution (F-Droid or its official GitHub releases), **not** an outdated Play Store build. When safely parked and able to interact with the phone:

1. In Termux, run `pkg update && pkg install openjdk-17 gh git`.
2. Run `gh auth login` and sign in to the GitHub account that can manage Actions secrets for this repository.
3. Clone this repository with `git clone https://github.com/P1024P535/baedalwang-game.git`, then `cd baedalwang-game`.
4. Run `bash scripts/setup-upload-key.sh`. This generates a new upload key **on the phone**, and submits four encrypted GitHub Actions secrets. Enter and securely back up the passwords.
5. Back up the generated `~/baedalwang-upload.jks` outside the phone in a private, secure location. Never put the keystore or passwords into GitHub commits, chat, screenshots, or public cloud links.
6. In the GitHub Actions page, manually run **Build Baedalwang Test APK**. Verify the signing step and download `baedalwang-signed-release-aab` only after it succeeds.
7. In Play Console, create the new Baedalwang app, configure Play App Signing, and upload the signed AAB to an internal test track. The existing developer account can host another app, but the app must be created separately.

**Do not perform these phone steps while riding or driving.** These steps are not yet executed; no upload key has been provisioned. App signing enrollment and Play Console upload are not automated by the build workflow.
