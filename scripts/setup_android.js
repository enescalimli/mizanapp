const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const ANDROID_DIR = path.join(PROJECT_ROOT, 'android');
const APP_DIR = path.join(ANDROID_DIR, 'app');
const MAIN_DIR = path.join(APP_DIR, 'src', 'main');
const JAVA_DIR = path.join(MAIN_DIR, 'java', 'tr', 'mizanapp', 'katilim');
const RES_DIR = path.join(MAIN_DIR, 'res');

console.log('--- Mizan Katılım Android Projesi Oluşturuluyor ---');

// 1. Dizinleri Oluştur
[
  ANDROID_DIR,
  APP_DIR,
  JAVA_DIR,
  path.join(RES_DIR, 'values'),
  path.join(RES_DIR, 'layout'),
  path.join(RES_DIR, 'drawable'),
  path.join(RES_DIR, 'mipmap-hdpi'),
  path.join(RES_DIR, 'mipmap-mdpi'),
  path.join(RES_DIR, 'mipmap-xhdpi'),
  path.join(RES_DIR, 'mipmap-xxhdpi'),
  path.join(RES_DIR, 'mipmap-xxxhdpi'),
].forEach((d) => fs.mkdirSync(d, { recursive: true }));

// 2. İkonları Üret
const srcIcon = path.join(PROJECT_ROOT, 'frontend', 'public', 'brand', 'logo-512.png');
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

async function generateIcons() {
  if (fs.existsSync(srcIcon)) {
    console.log('App ikonları üretiliyor...');
    for (const [folder, size] of Object.entries(iconSizes)) {
      const destPath = path.join(RES_DIR, folder, 'ic_launcher.png');
      const destRoundPath = path.join(RES_DIR, folder, 'ic_launcher_round.png');
      await sharp(srcIcon).resize(size, size).png().toFile(destPath);
      await sharp(srcIcon).resize(size, size).png().toFile(destRoundPath);
    }
  }
}

// 3. Dosyaları Yaz

// A) settings.gradle
fs.writeFileSync(
  path.join(ANDROID_DIR, 'settings.gradle'),
  `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "MizanKatilim"
include ':app'
`
);

// B) build.gradle (Root)
fs.writeFileSync(
  path.join(ANDROID_DIR, 'build.gradle'),
  `plugins {
    id 'com.android.application' version '8.3.2' apply false
}
`
);

// C) gradle.properties
fs.writeFileSync(
  path.join(ANDROID_DIR, 'gradle.properties'),
  `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
`
);

// D) local.properties
const sdkDir = path.join(process.env.HOME, 'Library', 'Android', 'sdk');
fs.writeFileSync(
  path.join(ANDROID_DIR, 'local.properties'),
  `sdk.dir=${sdkDir}\n`
);

// E) app/build.gradle
fs.writeFileSync(
  path.join(APP_DIR, 'build.gradle'),
  `plugins {
    id 'com.android.application'
}

android {
    namespace 'tr.mizanapp.katilim'
    compileSdk 34

    defaultConfig {
        applicationId "tr.mizanapp.katilim"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.debug
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.swiperefreshlayout:swiperefreshlayout:1.1.0'
    implementation 'androidx.webkit:webkit:1.10.0'
}
`
);

// F) AndroidManifest.xml
fs.writeFileSync(
  path.join(MAIN_DIR, 'AndroidManifest.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.MizanKatilim"
        android:usesCleartextTraffic="false">
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:exported="true"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
);

// G) values/strings.xml
fs.writeFileSync(
  path.join(RES_DIR, 'values', 'strings.xml'),
  `<resources>
    <string name="app_name">Mizan Katılım</string>
</resources>
`
);

// H) values/colors.xml
fs.writeFileSync(
  path.join(RES_DIR, 'values', 'colors.xml'),
  `<resources>
    <color name="primary_navy">#182542</color>
    <color name="pure_black">#000000</color>
    <color name="accent_emerald">#10B981</color>
    <color name="bg_light">#EEF0F4</color>
</resources>
`
);

// I) values/styles.xml
fs.writeFileSync(
  path.join(RES_DIR, 'values', 'styles.xml'),
  `<resources>
    <style name="Theme.MizanKatilim" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/primary_navy</item>
        <item name="colorPrimaryDark">@color/pure_black</item>
        <item name="colorAccent">@color/accent_emerald</item>
        <item name="android:statusBarColor">@color/pure_black</item>
        <item name="android:navigationBarColor">@color/pure_black</item>
        <item name="android:windowBackground">@color/pure_black</item>
    </style>
</resources>
`
);

// J) layout/activity_main.xml
fs.writeFileSync(
  path.join(RES_DIR, 'layout', 'activity_main.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<androidx.swiperefreshlayout.widget.SwipeRefreshLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/swipeRefreshLayout"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webView"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="#000000" />

</androidx.swiperefreshlayout.widget.SwipeRefreshLayout>
`
);

// K) MainActivity.java
fs.writeFileSync(
  path.join(JAVA_DIR, 'MainActivity.java'),
  `package tr.mizanapp.katilim;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private static final String APP_URL = "https://mizanapp.tr";
    private WebView webView;
    private SwipeRefreshLayout swipeRefresh;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        swipeRefresh = findViewById(R.id.swipeRefreshLayout);
        webView = findViewById(R.id.webView);

        swipeRefresh.setColorSchemeResources(R.color.accent_emerald, R.color.primary_navy);
        swipeRefresh.setOnRefreshListener(() -> webView.reload());

        // WebView Ayarları
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // %90 Görünüm Ölçeğini Native Olarak Uygula
        settings.setTextZoom(90);

        // Çerezleri Kalıcı Yap
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        // Donanım Hızlandırma
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        // Tarayıcı İstemcisi
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.contains("mizanapp.tr") || url.contains("supabase.co") || url.contains("accounts.google.com")) {
                    return false; // Uygulama içinde aç
                }
                return false;
            }

            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                swipeRefresh.setRefreshing(false);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                swipeRefresh.setRefreshing(false);
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress == 100) {
                    swipeRefresh.setRefreshing(false);
                }
            }
        });

        // Geri Tuşu Davranışı (Sayfa geçmişinde geri git)
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    setEnabled(false);
                    getOnBackPressedDispatcher().onBackPressed();
                }
            }
        });

        // Sayfayı Yükle
        if (savedInstanceState == null) {
            webView.loadUrl(APP_URL);
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }
}
`
);

async function main() {
  await generateIcons();
  console.log('Android proje dosyaları başarıyla oluşturuldu.');
}

main().catch(console.error);
