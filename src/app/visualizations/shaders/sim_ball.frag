uniform float ball_speed;
uniform float camera_framerate;
uniform float camera_pipeline_delay;
uniform float camera_sensor_integration;
uniform float camera_display_strobing;


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
    if(0 >= len){
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



float simulate_camera(vec2 pixel_pos){
    float ball_squared = 1 - pixel_pos.y * pixel_pos.y;
    if (ball_squared <= 0) {
        // Our y position has no ball
        return 0.0;
    }

    float pos = -pixel_pos.x;

    float ball_end = sqrt(ball_squared);
    float ball_start = -ball_end;
    float ball_size = ball_end - ball_start;

    float integration_distance_sensor = compute_integration_distance_sensor(
        camera_framerate,
        2.0 * ball_speed, // Ball speed in diameter; required in radius
        camera_sensor_integration
    );
    float integration_offset_sensor = compute_integration_offset_sensor(
        camera_framerate,
        2.0 * ball_speed, // Ball speed in diameter; required in radius
        camera_pipeline_delay
    );

    float sensor_curve_rise_time = min(ball_size, integration_distance_sensor);
    float sensor_curve_p0 = ball_start + integration_offset_sensor;
    float sensor_curve_p1 = sensor_curve_p0 + sensor_curve_rise_time;
    float sensor_curve_p3 = ball_end + integration_offset_sensor + integration_distance_sensor;
    float sensor_curve_p2 = sensor_curve_p3 - sensor_curve_rise_time;
    float sensor_curve_plateau_brightness = 1.0;
    if (ball_size < integration_distance_sensor) {
        sensor_curve_plateau_brightness = ball_size / integration_distance_sensor;
    }

    float display_hold_distance = compute_integration_distance_display(
        camera_framerate,
        2.0 * ball_speed,
        camera_display_strobing
    );

    float display_value = integrate_sensor_curve(sensor_curve_p0, sensor_curve_p1, sensor_curve_p2, sensor_curve_p3, pos - display_hold_distance, display_hold_distance);

    return display_value * sensor_curve_plateau_brightness;
}

void main()
{
    vec2 pixel_pos = widget_size * uvs;

    float ball_diameter_pixels = widget_size.y/3;

    vec2 rel_pos = (vec2(ball_diameter_pixels * 2., widget_size.y/2.) - pixel_pos) / ball_diameter_pixels;
    float rel_dist = length(rel_pos);

    float camera_value = simulate_camera(rel_pos);
    float ball_value = 0.0;
    if(rel_dist <= 1.0){
        ball_value = 1.0;
    }

    vec3 camera_color = linear_to_srgb(vec3(camera_value, 0, 0)) * 0.5;
    vec3 ball_color = vec3(ball_value, ball_value, ball_value) * 0.5;

    // Add alpha and do gamma correction
    color = vec4(camera_color + ball_color, 1.0);
}
