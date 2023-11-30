import type { PointLike3D, QuaternionLike } from "../types";

export const roundUp = (num: number): number =>
  Math.round((num + Number.EPSILON) * 100) / 100;

export const mod360 = (degrees: number): number => (360 + degrees) % 360;

/**
 * Reference https://github.com/toji/gl-matrix/blob/master/src/common.js#L7C24-L7C32s
 */
export const GL_EPSILON = 0.000001;

/**
 * Returns an euler angle representation of a quaternion
 * @see https://github.com/toji/gl-matrix/issues/329#issuecomment-404763425
 * @param  {QuaternionLike} quat Quaternion
 * @return {PointLike3D}
 */
export function getEulerAngles({ x, y, z, w }: QuaternionLike): PointLike3D {
  const x2 = x * x;
  const y2 = y * y;
  const z2 = z * z;
  const w2 = w * w;

  const unit = x2 + y2 + z2 + w2;
  const test = x * w + y * z;
  // TODO: might be better to use gl-matrix EPSILON see: https://github.com/toji/gl-matrix/blob/master/src/common.js#L7C24-L7C32s
  // const threshold = 0.5 - Number.EPSILON;
  const threshold = 0.5 - GL_EPSILON;

  let yaw = 2 * Math.atan2(y, x);
  let pitch = 0;
  let roll = 0;

  if (test > threshold * unit) {
    // singularity at the north pole
    pitch = Math.PI / 2;
  } else if (test < -threshold * unit) {
    // singularity at the south pole
    pitch = -Math.PI / 2;
  } else {
    yaw = Math.atan2(2 * (x * w + y * z), w2 - x2 - y2 + z2);
    pitch = Math.asin(2 * (w * y - x * z));
    roll = Math.atan2(2 * (x * y + z * w), 1 - 2 * (y2 + z2));
  }

  const normalize = {
    x: Number.isNaN(yaw) ? 0 : yaw,
    y: Number.isNaN(pitch) ? 0 : pitch,
    z: Number.isNaN(roll) ? 0 : roll,
  };

  return {
    x: mod360(normalize.x * (180 / Math.PI)),
    y: mod360(normalize.y * (180 / Math.PI)),
    z: mod360(normalize.z * (180 / Math.PI)),
  };
}

// export function getEulerAnglesZYX(q: QuaternionLike): PointLike3D {
//   const sinr_cosp = 2 * (q.w * q.x + q.y * q.z);
//   const cosr_cosp = 1 - 2 * (q.x * q.x + q.y * q.y);
//   const roll = Math.atan2(sinr_cosp, cosr_cosp);

//   const sinp = 2 * (q.w * q.y - q.z * q.x);
//   let pitch;
//   if (Math.abs(sinp) >= 1) {
//     pitch = Math.sign(sinp) * (Math.PI / 2); // Use 90 degrees if out of range
//   } else {
//     pitch = Math.asin(sinp);
//   }

//   const siny_cosp = 2 * (q.w * q.z + q.x * q.y);
//   const cosy_cosp = 1 - 2 * (q.y * q.y + q.z * q.z);
//   const yaw = Math.atan2(siny_cosp, cosy_cosp);

//   return {
//     x: roll * (180 / Math.PI),
//     y: pitch * (180 / Math.PI),
//     z: yaw * (180 / Math.PI),
//   };
// }

// export const LocalToGlobal3D = (worldPosition: PointLike3D): PointLike3D => ({
//   x: 0,
//   y: 0,
//   z: 0,
// });
