// v7.7: exposes SSAOPass for the PC-only Ultra tier (gl.js only uses it when Ultra is on).
import {SSAOPass} from './vendor/three/addons/postprocessing/SSAOPass.js';
window.FS_SSAO=SSAOPass;
