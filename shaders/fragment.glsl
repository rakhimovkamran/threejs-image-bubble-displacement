uniform float time;
uniform float progress;

uniform vec4 resolution;
uniform sampler2D cover;

varying vec2 vUv;
varying vec3 vPosition;
uniform vec3 pointer;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main() {

	vec2 direction = normalize(vPosition.xy - pointer.xy);
	float dist = length(vPosition - pointer);

	float proximity = 1. - map(dist, 0., 0.2, 0., 1.);
	proximity = clamp(proximity, 0., 1.);

	vec2 zoomedUV = vUv + direction * proximity * progress;
	vec2 zoomedUV1 = mix(vUv, pointer.xy + vec2(0.5), proximity * progress);

	vec4 textColor = texture2D(cover, zoomedUV1);

	gl_FragColor = textColor;

}