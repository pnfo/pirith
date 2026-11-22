// The pirith web app (Pirith/www, copied there by dev/sync-apps.sh) in a WKWebView, with the audio played by
// NativePlayer (Player.swift) so that it carries on with the screen locked and shows on the lock screen.
// The pages are served at app://pirith/, a real origin, so scripts, data files and localStorage work as on the web.
// Links to other sites open in Safari.
import AVFoundation
import UIKit
import WebKit

@main
final class AppDelegate: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        // .playback: audio continues with the ring switch on silent and in the background (UIBackgroundModes: audio)
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        return true
    }

    func application(_ application: UIApplication, configurationForConnecting session: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        UISceneConfiguration(name: "Default", sessionRole: session.role)
    }
}

final class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options: UIScene.ConnectionOptions) {
        guard let scene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: scene)
        window.rootViewController = WebViewController()
        window.makeKeyAndVisible()
        self.window = window
    }
}

let home = URL(string: "app://pirith/index.html")!
let lightBar = UIColor(red: 0x2e / 255, green: 0x4c / 255, blue: 0x37 / 255, alpha: 1) // header in light mode
let darkBar = UIColor(red: 0x29 / 255, green: 0x25 / 255, blue: 0x24 / 255, alpha: 1)  // header in dark mode

final class WebViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    private var webView: WKWebView!
    private var player: NativePlayer!
    private let topBar = UIView() // behind the status bar: the colour of the header of the page

    override func loadView() {
        let www = Bundle.main.resourceURL!.appendingPathComponent("www")
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(BundleSchemeHandler(root: www), forURLScheme: "app")
        config.userContentController.add(WeakHandler(self), name: "statusBar")
        config.userContentController.add(WeakHandler(self), name: "nativePlayer")
        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .never // the web view is inside the safe area
        #if DEBUG
        if #available(iOS 16.4, *) { webView.isInspectable = true }
        #endif

        player = NativePlayer(root: www) { [weak self] json in
            self?.webView.evaluateJavaScript("window.__pirithNative&&window.__pirithNative(\(json))", completionHandler: nil)
        }

        let view = UIView()
        view.backgroundColor = lightBar
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0xe8 / 255, green: 0xf5 / 255, blue: 0xe9 / 255, alpha: 1)
        topBar.backgroundColor = lightBar
        for v in [topBar, webView!] { v.translatesAutoresizingMaskIntoConstraints = false; view.addSubview(v) }
        let safe = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            topBar.topAnchor.constraint(equalTo: view.topAnchor), topBar.bottomAnchor.constraint(equalTo: safe.topAnchor),
            topBar.leadingAnchor.constraint(equalTo: view.leadingAnchor), topBar.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.topAnchor.constraint(equalTo: safe.topAnchor), webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: safe.leadingAnchor), webView.trailingAnchor.constraint(equalTo: safe.trailingAnchor),
        ])
        self.view = view

        OldStorage.migrate(into: webView) { [weak self] in self?.webView.load(URLRequest(url: home)) }
    }

    override var preferredStatusBarStyle: UIStatusBarStyle { .lightContent } // the header is dark green or dark grey

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        switch message.name {
        case "nativePlayer": // src/player/native.js: { cmd, ... }
            if let command = message.body as? [String: Any] { player.run(command) }
        case "statusBar":    // src/stores/player.js: 'dark' | 'light'
            let dark = (message.body as? String) == "dark"
            topBar.backgroundColor = dark ? darkBar : lightBar
            view.backgroundColor = dark ? darkBar : lightBar
            webView.backgroundColor = dark ? UIColor(red: 0x1c / 255, green: 0x19 / 255, blue: 0x17 / 255, alpha: 1)
                                           : UIColor(red: 0xe8 / 255, green: 0xf5 / 255, blue: 0xe9 / 255, alpha: 1)
        default: break
        }
    }

    // links to other sites open in Safari (or the App Store, Youtube, Facebook…)
    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = action.request.url, !["app", "about", "file"].contains(url.scheme ?? "") else { return decisionHandler(.allow) }
        if ["http", "https", "mailto", "itms-apps"].contains(url.scheme ?? "") { UIApplication.shared.open(url) }
        decisionHandler(.cancel)
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = action.request.url, ["http", "https", "mailto"].contains(url.scheme ?? "") { UIApplication.shared.open(url) }
        return nil
    }

    // the web content process can be ended by the system (memory): reload instead of a blank page.
    // The reloaded page has no queue, so the player is stopped with it.
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        player.stop()
        webView.reload()
    }
}

/// The app before 3.0 showed its pages from file URLs, so its playlists, listening counts and settings are in the
/// localStorage of file://, which app://pirith can not see. They are read once from a file page and copied into the
/// new page's localStorage before the app starts (only keys the new one does not have yet).
enum OldStorage {
    static let key = "storage-migrated"
    private static var reader: Reader? // alive while it reads

    static func migrate(into webView: WKWebView, then: @escaping () -> Void) {
        guard !UserDefaults.standard.bool(forKey: key) else { return then() }
        let page = FileManager.default.temporaryDirectory.appendingPathComponent("migrate.html")
        try? "<script>var o={};try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);o[k]=localStorage.getItem(k)}}catch(e){}window.webkit.messageHandlers.oldStorage.postMessage(JSON.stringify(o))</script>"
            .write(to: page, atomically: true, encoding: .utf8)
        let r = Reader(webView: webView, then: then)
        reader = r
        let config = WKWebViewConfiguration() // the default data store, as the old app's
        config.userContentController.add(r, name: "oldStorage")
        r.hidden = WKWebView(frame: .zero, configuration: config)
        r.hidden?.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent())
        DispatchQueue.main.asyncAfter(deadline: .now() + 5) { r.finish("{}") } // never wait longer
    }

    final class Reader: NSObject, WKScriptMessageHandler {
        weak var webView: WKWebView?
        var hidden: WKWebView?
        var then: (() -> Void)?
        init(webView: WKWebView, then: @escaping () -> Void) { self.webView = webView; self.then = then }

        func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
            finish(message.body as? String ?? "{}")
        }

        func finish(_ json: String) {
            guard let then else { return }
            self.then = nil
            hidden?.configuration.userContentController.removeScriptMessageHandler(forName: "oldStorage")
            hidden = nil
            OldStorage.reader = nil
            UserDefaults.standard.set(true, forKey: OldStorage.key)
            if json != "{}", let webView {
                webView.configuration.userContentController.addUserScript(WKUserScript(
                    source: "try{if(location.protocol=='app:'&&!localStorage.getItem('old-storage-copied')){var o=JSON.parse(\(jsString(json)));for(var k in o){if(localStorage.getItem(k)===null)localStorage.setItem(k,o[k])}localStorage.setItem('old-storage-copied','1')}}catch(e){}",
                    injectionTime: .atDocumentStart, forMainFrameOnly: true))
            }
            then()
        }
    }
}

/// the message handler is kept by the configuration: not the view controller itself
final class WeakHandler: NSObject, WKScriptMessageHandler {
    weak var target: WKScriptMessageHandler?
    init(_ target: WKScriptMessageHandler) { self.target = target }
    func userContentController(_ c: WKUserContentController, didReceive m: WKScriptMessage) { target?.userContentController(c, didReceive: m) }
}

/// serves the bundled web app at app://pirith/…
final class BundleSchemeHandler: NSObject, WKURLSchemeHandler {
    private let root: URL
    init(root: URL) { self.root = root.standardizedFileURL }

    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url else { return }
        var path = String(url.path.dropFirst())
        if path.isEmpty || path.hasSuffix("/") { path += "index.html" }
        let file = root.appendingPathComponent(path).standardizedFileURL
        guard file.path.hasPrefix(root.path + "/"), let data = try? Data(contentsOf: file, options: .mappedIfSafe) else {
            task.didReceive(HTTPURLResponse(url: url, statusCode: 404, httpVersion: "HTTP/1.1", headerFields: nil)!)
            task.didFinish()
            return
        }
        let headers = ["Content-Type": mimeType(file.pathExtension), "Content-Length": String(data.count), "Cache-Control": "no-cache"]
        task.didReceive(HTTPURLResponse(url: url, statusCode: 200, httpVersion: "HTTP/1.1", headerFields: headers)!)
        task.didReceive(data)
        task.didFinish()
    }

    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}

    private func mimeType(_ ext: String) -> String {
        switch ext.lowercased() {
        case "html": return "text/html; charset=utf-8"
        case "js", "mjs": return "text/javascript; charset=utf-8"
        case "css": return "text/css; charset=utf-8"
        case "json": return "application/json"
        case "svg": return "image/svg+xml"
        case "png": return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "webp": return "image/webp"
        case "m4a": return "audio/mp4"
        case "woff2": return "font/woff2"
        default: return "application/octet-stream"
        }
    }
}

/// a JavaScript string literal
func jsString(_ s: String) -> String {
    guard let data = try? JSONEncoder().encode(s), let literal = String(data: data, encoding: .utf8) else { return "\"\"" }
    return literal
}
