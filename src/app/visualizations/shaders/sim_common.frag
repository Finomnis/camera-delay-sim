
in vec2 uvs;

uniform vec2 widget_size;
uniform float time;
uniform float ball_speed;
uniform float camera_framerate;
uniform float camera_pipeline_delay;
uniform float camera_sensor_integration;
uniform float camera_display_strobing;

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


float sample_sensor_curve(float p0, float p1, float p2, float p3, float pos){
    if (pos < p0) {
        return 0.0;
    }
    if (pos < p1) {
        return (pos - p0) / (p1 - p0);
    }
    if (pos < p2) {
        return 1.0;
    }
    if (pos < p3) {
        return (pos - p3) / (p2 - p3);
    }
    return 0.0;
}

float compute_partial_triangle_area(float p0, float p1, float x){
    float bottom_side = x - p0;
    float right_side = (x-p0) / (p1-p0);
    float area = bottom_side * right_side * 0.5;
    return area;
}

float integrate_sensor_curve(float p0, float p1, float p2, float p3, float pos, float len){
    if(0.0 >= len){
        return sample_sensor_curve(p0, p1, p2, p3, pos);
    }

    float start = pos;
    float end = pos + len;

    float overlap_rising_start = max(p0, start);
    float overlap_rising_end = min(p1, end);
    float overlap_plateau_start = max(p1, start);
    float overlap_plateau_end = min(p2, end);
    float overlap_falling_start = max(p2, start);
    float overlap_falling_end = min(p3, end);

    float value_total;

    if(overlap_rising_end > overlap_rising_start){
        value_total += (
            compute_partial_triangle_area(p0, p1, overlap_rising_end)
            - compute_partial_triangle_area(p0, p1, overlap_rising_start)
        );
    }

    if(overlap_plateau_end > overlap_plateau_start){
        value_total += overlap_plateau_end - overlap_plateau_start;
    }


    if(overlap_falling_end > overlap_falling_start){
        value_total += (
            compute_partial_triangle_area(p3, p2, overlap_falling_end)
            - compute_partial_triangle_area(p3, p2, overlap_falling_start)
        );
    }

    return value_total / len;
}
