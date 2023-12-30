package com.rn_map_offline

import fi.iki.elonen.NanoHTTPD
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.PermissionAwareActivity
import com.facebook.react.modules.core.PermissionListener
import java.io.FileInputStream
import java.io.IOException

class AppServerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), PermissionListener {

    private val server = AppServer()
    private var serverStartPromise: Promise? = null

    private companion object {
        const val READ_STORAGE_PERMISSION_REQUEST_CODE = 1
    }

    override fun getName(): String {
        return "AppServer"
    }

    @ReactMethod
    fun startServer(promise: Promise) {
        serverStartPromise = promise
        if (ContextCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            val activity = currentActivity
            if (activity is PermissionAwareActivity) {
                ActivityCompat.requestPermissions(activity, arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE), READ_STORAGE_PERMISSION_REQUEST_CODE)
            } else {
                serverStartPromise?.reject("ACTIVITY_NOT_FOUND", "Activity doesn't implement PermissionAwareActivity.")
                serverStartPromise = null
            }
        } else {
            try {
                server.start(NanoHTTPD.SOCKET_READ_TIMEOUT, false)
                serverStartPromise?.resolve(null)
            } catch (e: IOException) {
                e.printStackTrace()
                serverStartPromise?.reject("SERVER_START_ERROR", e.localizedMessage ?: "Error starting server")
            } finally {
                serverStartPromise = null
            }
        }
    }

    @ReactMethod
    fun stopServer() {
        server.stop()
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray): Boolean {
        when (requestCode) {
            READ_STORAGE_PERMISSION_REQUEST_CODE -> {
                if ((grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED)) {
                    try {
                        server.start(NanoHTTPD.SOCKET_READ_TIMEOUT, false)
                        serverStartPromise?.resolve(null)
                    } catch (e: IOException) {
                        e.printStackTrace()
                        serverStartPromise?.reject("SERVER_START_ERROR", e.localizedMessage ?: "Error starting server")
                    }
                } else {
                    serverStartPromise?.reject("PERMISSION_DENIED", "Storage permission denied by user.")
                }
                serverStartPromise = null
                return true
            }
        }
        return false
    }

    private class AppServer : NanoHTTPD(3000) {
    override fun serve(session: IHTTPSession): Response {
        
        val tileRegex = "/tiles/(\\d+)/(\\d+)/(\\d+).png".toRegex()
        val matchResult = tileRegex.find(session.uri)
        return if (matchResult != null) {
            val (z, x, y) = matchResult.destructured
            
            try {
                val filePath = "/sdcard/Download/tiles/$z/$x/$y.png"
                val fis = FileInputStream(filePath)
                newChunkedResponse(Response.Status.OK, "image/png", fis)
            } catch (e: IOException) {
                newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "File not found")
            }
        } else {
            newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "Not found")
        }
    }
}
}