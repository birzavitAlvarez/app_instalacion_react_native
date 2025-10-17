package com.apptecnicosv2

import android.app.Activity
import android.content.Intent
import android.speech.RecognizerIntent
import com.facebook.react.bridge.*
import java.util.*

class GoogleVoiceModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {
    
    private var voicePromise: Promise? = null
    private val VOICE_REQUEST_CODE = 9876

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = "GoogleVoice"

    @ReactMethod
    fun startVoiceRecognition(locale: String, promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No hay actividad disponible")
            return
        }

        voicePromise = promise

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale)
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Habla el código de nevera")
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        }

        try {
            activity.startActivityForResult(intent, VOICE_REQUEST_CODE, null)
        } catch (e: Exception) {
            promise.reject("START_ERROR", "Error al iniciar: ${e.message}")
            voicePromise = null
        }
    }

    override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?
    ) {
        if (requestCode == VOICE_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                val matches = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
                if (matches != null && matches.isNotEmpty()) {
                    val rawText = matches[0]
                    // Preparar versión sin espacios y en mayúsculas (para códigos)
                    val cleanText = rawText.replace("\\s+".toRegex(), "").uppercase()
                    
                    val result = Arguments.createMap().apply {
                        putString("raw", rawText)           // Original con espacios: "uno dos tres"
                        putString("text", cleanText)        // Sin espacios, mayúsculas: "UNODOSTRES"
                        putString("rawUpper", rawText.uppercase())  // Con espacios, mayúsculas: "UNO DOS TRES"
                    }
                    voicePromise?.resolve(result)
                } else {
                    voicePromise?.reject("NO_MATCH", "No se reconoció ningún texto")
                }
            } else if (resultCode == Activity.RESULT_CANCELED) {
                voicePromise?.reject("CANCELLED", "Usuario canceló el dictado")
            } else {
                voicePromise?.reject("ERROR", "Error desconocido")
            }
            voicePromise = null
        }
    }

    override fun onNewIntent(intent: Intent) {
        // No se necesita
    }
}
