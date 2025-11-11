//
//  BiometricCheckPlugin.m
//

#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(BiometricCheckPlugin, "BiometricCheck",
    CAP_PLUGIN_METHOD(initialize, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(clear, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(didBiometricsChange, CAPPluginReturnPromise);
)
