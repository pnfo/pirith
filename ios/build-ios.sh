#!/usr/bin/env bash
# The iOS app "Pirith" (lk.pitaka.pirith, ios/project.yml), with Xcode on this Mac:
#   ios/build-ios.sh sim                 debug build for the simulator -> build/sim/Build/Products/Debug-iphonesimulator/Pirith.app
#   ios/build-ios.sh archive [--upload]  archive + export -> build/export/Pirith.ipa, and upload it to App Store Connect (TestFlight)
# The web app comes from `npm run build:app` (dist-app/), copied to Pirith/www. Add --skip-web to reuse the copy that is there.
# Signing is automatic with the account signed in to Xcode (-allowProvisioningUpdates). The upload needs an App Store
# Connect API key: set ASC_KEY_ID, ASC_ISSUER_ID and ASC_KEY_PATH (the same ones the other pitaka.lk apps use).
# VERSION must be higher than the version in the App Store; BUILD (default yymmddHHMM) must be new for every upload.
set -euo pipefail
cd "$(dirname "$0")"
TEAM_ID=${TEAM_ID:-4456F3J27A}
VERSION=${VERSION:-3.1}
BUILD=${BUILD:-$(date +%y%m%d%H%M)}
export TEAM_ID VERSION BUILD
WHAT=${1:-sim}
UPLOAD=0; WEB=1
for arg in "${@:2}"; do
  case "$arg" in --upload) UPLOAD=1 ;; --skip-web) WEB=0 ;; *) echo "unknown option: $arg"; exit 2 ;; esac
done
B=build

if [ "$WEB" = 1 ]; then
  (cd .. && npm run build:app)
  mkdir -p Pirith/www
  rsync -rlt --delete --exclude=.DS_Store --exclude='._*' ../dist-app/ Pirith/www/
fi
[ -s Pirith/www/index.html ] || { echo "Pirith/www is empty - run without --skip-web"; exit 1; }
echo "www: $(du -sh Pirith/www | cut -f1)"

mkdir -p "$B"
xcodegen generate --quiet

if [ "$WHAT" = sim ]; then
  xcodebuild -project Pirith.xcodeproj -scheme Pirith-iOS -configuration Debug -destination 'generic/platform=iOS Simulator' \
    -derivedDataPath "$B/sim" build -quiet
  echo "$PWD/$B/sim/Build/Products/Debug-iphonesimulator/Pirith.app"
  exit 0
fi

xcodebuild -project Pirith.xcodeproj -scheme Pirith-iOS -configuration Release -destination 'generic/platform=iOS' \
  -archivePath "$B/Pirith.xcarchive" -allowProvisioningUpdates archive -quiet
cat > "$B/ExportOptions.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>export</string>
  <key>teamID</key><string>$TEAM_ID</string>
  <key>signingStyle</key><string>automatic</string>
  <key>manageAppVersionAndBuildNumber</key><false/>
  <key>uploadSymbols</key><true/>
</dict></plist>
PLIST
rm -rf "$B/export"
# the export copies with /usr/bin/rsync, which runs "rsync" from PATH: Homebrew's rejects Apple's options
PATH="/usr/bin:/bin:/usr/sbin:/sbin:$PATH" xcodebuild -exportArchive -archivePath "$B/Pirith.xcarchive" -exportOptionsPlist "$B/ExportOptions.plist" \
  -exportPath "$B/export" -allowProvisioningUpdates -quiet
IPA=$(find "$B/export" -maxdepth 1 -name '*.ipa' | head -1)
echo "Pirith $VERSION ($BUILD): $IPA $(du -h "$IPA" | cut -f1)"
[ "$UPLOAD" = 1 ] || exit 0
: "${ASC_KEY_ID:?set ASC_KEY_ID}" "${ASC_ISSUER_ID:?set ASC_ISSUER_ID}" "${ASC_KEY_PATH:?set ASC_KEY_PATH}"
xcrun altool --upload-app -f "$IPA" -t ios --api-key "$ASC_KEY_ID" --api-issuer "$ASC_ISSUER_ID" --p8-file-path "$ASC_KEY_PATH" 2>&1 | grep -v -e Progress -e '^$'
