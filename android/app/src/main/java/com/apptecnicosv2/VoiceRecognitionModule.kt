package com.apptecnicosv2

import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class VoiceRecognitionModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false

    override fun getName(): String {
        return "VoiceRecognition"
    }

    @ReactMethod
    fun startListening(locale: String, promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "No hay actividad disponible")
            return
        }

        if (!SpeechRecognizer.isRecognitionAvailable(reactApplicationContext)) {
            promise.reject("NOT_AVAILABLE", "Reconocimiento de voz no disponible")
            return
        }

        // IMPORTANTE: Ejecutar en el UI thread (hilo principal)
        activity.runOnUiThread {
            try {
                // Detener reconocimiento previo si existe
                stopListening()

                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactApplicationContext)
                
                speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {
                        sendEvent("onSpeechStart", null)
                    }

                    override fun onBeginningOfSpeech() {
                        isListening = true
                    }

                    override fun onRmsChanged(rmsdB: Float) {
                        // Volumen del audio
                    }

                    override fun onBufferReceived(buffer: ByteArray?) {
                        // Buffer de audio
                    }

                    override fun onEndOfSpeech() {
                        isListening = false
                        sendEvent("onSpeechEnd", null)
                    }

                    override fun onError(error: Int) {
                        isListening = false
                        val errorMessage = getErrorText(error)
                        val params = Arguments.createMap().apply {
                            putString("message", errorMessage)
                            putInt("code", error)
                        }
                        sendEvent("onSpeechError", params)
                    }

                    override fun onResults(results: Bundle?) {
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        if (matches != null && matches.isNotEmpty()) {
                            val rawText = matches[0]
                            // Eliminar espacios para códigos alfanuméricos (ej: "1 2 3 4" -> "1234")
                            val cleanText = rawText.replace("\\s+".toRegex(), "").uppercase()
                            val params = Arguments.createMap().apply {
                                putString("value", cleanText)
                                putString("raw", rawText) // Texto original por si se necesita
                            }
                            sendEvent("onSpeechResults", params)
                        }
                    }

                    override fun onPartialResults(partialResults: Bundle?) {
                        val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        if (matches != null && matches.isNotEmpty()) {
                            val rawText = matches[0]
                            // Eliminar espacios para códigos alfanuméricos
                            val cleanText = rawText.replace("\\s+".toRegex(), "").uppercase()
                            val params = Arguments.createMap().apply {
                                putString("value", cleanText)
                                putString("raw", rawText)
                            }
                            sendEvent("onSpeechPartialResults", params)
                        }
                    }

                    override fun onEvent(eventType: Int, params: Bundle?) {
                        // Eventos adicionales
                    }
                })

                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale)
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
                }

                speechRecognizer?.startListening(intent)
                promise.resolve(true)
                
            } catch (e: Exception) {
                promise.reject("START_ERROR", "Error al iniciar: ${e.message}")
            }
        }
    }

    @ReactMethod
    fun stopListening() {
        val activity = reactApplicationContext.currentActivity
        activity?.runOnUiThread {
            try {
                speechRecognizer?.stopListening()
                speechRecognizer?.destroy()
                speechRecognizer = null
                isListening = false
            } catch (e: Exception) {
                // Ignorar errores al detener
            }
        } ?: run {
            // Si no hay actividad, intentar limpiar directamente
            try {
                speechRecognizer?.destroy()
                speechRecognizer = null
                isListening = false
            } catch (e: Exception) {
                // Ignorar
            }
        }
    }

    @ReactMethod
    fun destroy() {
        stopListening()
    }

    @ReactMethod
    fun isAvailable(promise: Promise) {
        val available = SpeechRecognizer.isRecognitionAvailable(reactApplicationContext)
        promise.resolve(available)
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private fun getErrorText(errorCode: Int): String {
        return when (errorCode) {
            SpeechRecognizer.ERROR_AUDIO -> "Error de audio"
            SpeechRecognizer.ERROR_CLIENT -> "Error del cliente"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Permisos insuficientes"
            SpeechRecognizer.ERROR_NETWORK -> "Error de red"
            SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Timeout de red"
            SpeechRecognizer.ERROR_NO_MATCH -> "No se reconoció el audio. Intenta hablar más claro"
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "Reconocedor ocupado. Intenta de nuevo"
            SpeechRecognizer.ERROR_SERVER -> "Error del servidor"
            SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No se detectó voz. Habla más fuerte"
            11 -> "Reconocedor cancelado. Presiona 'Intentar de nuevo'"
            else -> "Error $errorCode. Intenta de nuevo"
        }
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        destroy()
    }
}
