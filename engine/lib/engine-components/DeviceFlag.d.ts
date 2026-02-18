import { Behaviour } from "./Component.js";
export declare enum DeviceType {
    Never = 0,
    Desktop = 1,
    Mobile = 2
}
/**
 * Enables or disables the GameObject based on the device type (mobile or desktop).
 * You can use this to show or hide objects depending on whether the user is on a mobile device or a desktop.
 *
 * @summary Show or hide GameObject based on device type
 * @category Utilities
 * @group Components
 */
export declare class DeviceFlag extends Behaviour {
    visibleOn: DeviceType;
    onEnable(): void;
    apply(): void;
    private test;
}
