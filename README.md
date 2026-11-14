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
