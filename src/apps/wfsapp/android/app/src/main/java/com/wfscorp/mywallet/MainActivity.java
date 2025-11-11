package com.wfscorp.mywallet;

import android.os.Bundle;
import android.os.Build;
import android.graphics.Color;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    registerPlugin(BiometricCheckPlugin.class);
    super.onCreate(savedInstanceState);
  }
  private void setAndroidUiColor() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
      getWindow().setNavigationBarColor(Color.rgb(15, 21, 30));
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      getWindow().setNavigationBarDividerColor(Color.rgb(15, 21, 30));
    }
  }
}
