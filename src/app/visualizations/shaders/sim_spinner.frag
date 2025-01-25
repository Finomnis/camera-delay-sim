float simulate_camera(float pos_in_ball_radius, float ball_visible_body_size){
    float ball_end = ball_visible_body_size;
    float ball_start = -ball_visible_body_size;
    float ball_size = ball_end - ball_start;

    float integration_distance_sensor = compute_integration_distance_sensor(
        camera_framerate,
        2.0 * ball_speed, // Ball speed in diameter; required in radius
        camera_sensor_integration
    );

    float sensor_curve_rise_time = min(ball_size, integration_distance_sensor);
    float sensor_curve_p0 = ball_start;
    float sensor_curve_p1 = sensor_curve_p0 + sensor_curve_rise_time;
    float sensor_curve_p3 = ball_end + integration_distance_sensor;
    float sensor_curve_p2 = sensor_curve_p3 - sensor_curve_rise_time;
    float sensor_curve_plateau_brightness = 1.0;
    if (ball_size < integration_distance_sensor) {
        sensor_curve_plateau_brightness = ball_size / integration_distance_sensor;
    }

    float display_value = sample_sensor_curve(sensor_curve_p0, sensor_curve_p1, sensor_curve_p2, sensor_curve_p3, pos_in_ball_radius);

    return display_value * sensor_curve_plateau_brightness;
}


void main()
{
    float time_s = time;

    vec2 pixel_pos = 2.0 * uvs - vec2(1.0, 1.0);
    // Adjust aspect ratio to fit smaller side
    if(widget_size.y <= 0.0){
        return;
    }
    float aspect_ratio = widget_size.x / widget_size.y;
    if(aspect_ratio > 1.0){
        pixel_pos.x *= aspect_ratio;
    } else {
        pixel_pos.y /= aspect_ratio;
    }

    float ball_radius = 0.1;
    float ball_rotation_distance = 0.8;

    float ball_radius_angle_pct = ball_radius / ball_rotation_distance / radians(360.0);
    float ball_rotation_circumference = radians(360.0) * ball_rotation_distance;
    float ball_angle_pct_per_second = ball_speed * 2.0 * ball_radius_angle_pct;
    float ball_angle_pct = time_s * ball_angle_pct_per_second;

    float pixel_distance = length(pixel_pos);
    float pixel_angle_pct = atan(pixel_pos.y, pixel_pos.x) / radians(360.0);

    float pixel_ball_angle_dist = mod(ball_angle_pct - pixel_angle_pct, 1.0);
    if(pixel_ball_angle_dist >= 1.0 - ball_radius_angle_pct){
        // Correct the fact that the ball overflows by negative one ball radius
        pixel_ball_angle_dist -= 1.0;
    }



    float distance_from_rotation = (ball_rotation_distance - pixel_distance) / ball_radius;
    float body_size_fn_squared = (1.0 - distance_from_rotation * distance_from_rotation);
    if(body_size_fn_squared <= 0.0){
        color = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    float body_size_fn = sqrt(body_size_fn_squared);
    // Correct somewhat for the fact that the ball is not round
    body_size_fn *= ((1.0 + ball_rotation_distance / pixel_distance) / 2.0);

    float ball_body_angle_pct = ball_radius_angle_pct * body_size_fn;

    float ball_value = 0.0;

    if ((pixel_ball_angle_dist > - ball_body_angle_pct)
        && (pixel_ball_angle_dist < ball_body_angle_pct)) {
        ball_value = 1.0;
    }

    float frame = time_s * camera_framerate;
    float time_last_frame = floor(frame) / camera_framerate - camera_pipeline_delay;
    float position_in_frame = frame - floor(frame);
    float ball_angle_pct_last_frame = time_last_frame * ball_angle_pct_per_second;
    float pixel_ball_angle_dist_last_frame = mod(ball_angle_pct_last_frame - pixel_angle_pct, 1.0);
    if(pixel_ball_angle_dist_last_frame >= 1.0 - ball_radius_angle_pct){
        // Correct the fact that the ball overflows by negative one ball radius
        pixel_ball_angle_dist_last_frame -= 1.0;
    }
    float camera_value = simulate_camera(pixel_ball_angle_dist_last_frame / ball_radius_angle_pct, body_size_fn);

    if(position_in_frame > camera_display_strobing){
        camera_value = 0.0;
    }

    vec3 camera_color = linear_to_srgb(vec3(camera_value, 0.0, 0.0)) * 0.5;
    vec3 ball_color = vec3(ball_value, ball_value, ball_value) * 0.5;

    // Add alpha and do gamma correction
    color = vec4(camera_color + ball_color, 1.0);
}
