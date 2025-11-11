package com.wfscorp.mywallet;

import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.IOException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.UnrecoverableKeyException;
import java.security.cert.CertificateException;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.SecretKey;

@CapacitorPlugin(name = "BiometricCheck")
public class BiometricCheckPlugin extends Plugin {

  private static final String KEY_ALIAS = "myWorldWalletBios";

  @PluginMethod()
  public void initialize(PluginCall call) {
    JSObject ret = new JSObject();
    try {
      SecretKey key = keyGen();
      ret.put("status", "success");
      call.resolve(ret);
    } catch (NoSuchAlgorithmException | NoSuchProviderException | InvalidAlgorithmParameterException e) {
      ret.put("status", "failed");
      ret.put("message", e.getMessage());
      call.resolve(ret);
    }
  }

  @PluginMethod()
  public void clear(PluginCall call) {
    call.unimplemented("Not implemented on Android.");
  }

  @PluginMethod()
  public void didBiometricsChange(PluginCall call) {
    JSObject ret = new JSObject();
    try {
      KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
      keyStore.load(null);
      SecretKey key = (SecretKey) keyStore.getKey(KEY_ALIAS, null);
      Cipher cipher = Cipher.getInstance(KeyProperties.KEY_ALGORITHM_AES + "/" + KeyProperties.BLOCK_MODE_CBC + "/" + KeyProperties.ENCRYPTION_PADDING_PKCS7);
      cipher.init(Cipher.ENCRYPT_MODE, key);
      ret.put("value", false);
      call.resolve(ret);
    } catch (KeyStoreException | CertificateException | IOException | NoSuchAlgorithmException | UnrecoverableKeyException | NoSuchPaddingException e) {
      ret.put("value", true);
      ret.put("status", "failed");
      ret.put("message", e.getMessage());
      call.resolve(ret);
    } catch (InvalidKeyException e) {
      ret.put("value", true);
      ret.put("message", e.getMessage());
      call.resolve(ret);
    }
  }

  private SecretKey keyGen() throws NoSuchAlgorithmException, NoSuchProviderException, InvalidAlgorithmParameterException {
    KeyGenerator keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
    KeyGenParameterSpec.Builder builder = new KeyGenParameterSpec.Builder(KEY_ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
      .setBlockModes(KeyProperties.BLOCK_MODE_CBC)
      .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_PKCS7)
      .setUserAuthenticationRequired(true) // Require biometric authentication
      .setInvalidatedByBiometricEnrollment(true); // Invalidate the key if new biometrics are enrolled

    keyGenerator.init(builder.build());
    return keyGenerator.generateKey();
  }
}
