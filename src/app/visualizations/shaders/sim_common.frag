
in vec2 uvs;

uniform vec2 widget_size;
uniform float time;

layout (location = 0) out vec4 color;

float srgb_inverse_transfer(float col) {
    if (col <= 0.0031308) {
        return 12.92 * col;
    } else {
        return 1.055 * pow(col, 1.0/2.4) - 0.055;
    }
}

vec3 linear_to_srgb(vec3 col) {
    return vec3(
        srgb_inverse_transfer(col.r),
        srgb_inverse_transfer(col.g),
        srgb_inverse_transfer(col.b)
    );
}

// Result given in ball diameters
float compute_integration_distance_sensor(float fps, float ball_speed, float sensor_integration){
    return sensor_integration * ball_speed/fps;
}

// Result given in ball diameters
float compute_integration_offset_sensor(float fps, float ball_speed, float pipeline_delay){
    return pipeline_delay * ball_speed;
}

// Result given in ball diameters
float compute_integration_distance_display(float fps, float ball_speed, float display_strobing){
    return display_strobing * ball_speed/fps;
}
