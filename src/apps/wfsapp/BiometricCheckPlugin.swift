//
//  BiometricCheckPlugin.swift
//  This is used to compare the last hash of biometric's enrolled on a user's device, to the current set being used
//
import Foundation
import Capacitor
import LocalAuthentication

@objc(BiometricCheckPlugin)
public class BiometricCheckPlugin: CAPPlugin {
    @objc func initialize(_ call: CAPPluginCall) {
        let context = LAContext();
        var error: NSError?
        context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        if (error == nil) {
            UserDefaults.standard.set(context.evaluatedPolicyDomainState, forKey: "BiometricsEvaluatedPolicyState");
            call.resolve(["status": "success"]);
        }
        call.resolve(["status": "failed", "message": error ?? ""])
    }

    @objc func clear(_ call: CAPPluginCall) {
        UserDefaults.standard.removeObject(forKey: "BiometricsEvaludatedPolicyState");
        call.resolve(["status": "success"]);
    }

    @objc func didBiometricsChange(_ call: CAPPluginCall) {
        let context = LAContext();
        var error: NSError?
        context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error)
        let policyState = context.evaluatedPolicyDomainState
        if (error != nil) {
            call.resolve(["status": "failed", "message": error ?? ""])
        }
        if (error == nil && policyState != UserDefaults.standard.data(forKey: "BiometricsEvaluatedPolicyState")) {
            call.resolve(["value": true])
        }
        call.resolve(["value": false])
    }
}
