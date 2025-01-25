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
