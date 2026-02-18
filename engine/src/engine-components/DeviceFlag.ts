
import { serializable } from "../engine/engine_serialization_decorator.js";
import { DeviceUtilities } from "../engine/engine_utils.js";
import { Behaviour, GameObject } from "./Component.js";


export enum DeviceType {
    Never = 0,
    Desktop = 1 << 0,
    Mobile = 2 << 0,
}

/**
 * Enables or disables the GameObject based on the device type (mobile or desktop).  
 * You can use this to show or hide objects depending on whether the user is on a mobile device or a desktop.
 * 
 * @summary Show or hide GameObject based on device type
 * @category Utilities
 * @group Components
 */
export class DeviceFlag extends Behaviour {

    @serializable()
    visibleOn!: DeviceType;


    onEnable() {
        this.apply();
    }

    apply() {    
        if (!this.test()) {
            GameObject.setActive(this.gameObject, false);
        }
    }

    private test() : boolean {
        if(this.visibleOn < 0) return true;
        if(DeviceUtilities.isMobileDevice()) {
            return (this.visibleOn & (DeviceType.Mobile)) !== 0;
        }
        const allowDesktop = (this.visibleOn & (DeviceType.Desktop)) !== 0;
        return allowDesktop;
    }

}

/**@deprecated use isMobileDevice() */
function isMobile() {
    return DeviceUtilities.isMobileDevice();
};