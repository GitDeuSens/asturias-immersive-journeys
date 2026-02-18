import { AssetReference } from "../../engine/engine_addressables.js";
import { type NeedleXREventArgs } from "../../engine/xr/api.js";
import { Behaviour } from "../Component.js";
/**
 * Avatar component to setup a WebXR avatar with head and hand objects.
 *
 * The avatar will automatically synchronize the head and hand objects with the XR rig when entering an XR session.
 *
 * @summary WebXR Avatar component for head and hands synchronization
 * @category XR
 * @category Networking
 * @group Components
 */
export declare class Avatar extends Behaviour {
    head?: AssetReference;
    leftHand?: AssetReference;
    rightHand?: AssetReference;
    private _leftHandMeshes?;
    private _rightHandMeshes?;
    private _syncTransforms?;
    onEnterXR(_args: NeedleXREventArgs): Promise<void>;
    onLeaveXR(_args: NeedleXREventArgs): void;
    onUpdateXR(args: NeedleXREventArgs): void;
    onBeforeRender(): void;
    private updateHandVisibility;
    private updateRemoteAvatarVisibility;
    private tryFindAvatarObjectsIfMissing;
    private prepareAvatar;
    private loadAvatarObjects;
}
