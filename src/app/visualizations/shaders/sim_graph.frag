uniform float graph_horizontal_range_s;

float simulate_camera(float pos_in_ball_radius){
    float ball_end = 1.0;
    float ball_start = -1.0;
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
    vec2 pixel_pos = widget_size * uvs;

    float time_s = uvs.x * graph_horizontal_range_s;
    float pos = uvs.y;
    float ball_size = 0.02;
    float ball_pos = 2.0 * ball_speed * ball_size * time_s;

    float ball_value = 0.0;
    if(abs(pos - ball_pos) < ball_size){
        ball_value = 1.0;
    }

    float camera_frame = (time_s - camera_pipeline_delay) * camera_framerate;
    float time_last_frame = floor(camera_frame) / camera_framerate;
    float ball_pos_last_frame = 2.0 * ball_speed * ball_size * time_last_frame;
    float last_frame_pos_relative_to_ball = (ball_pos_last_frame - pos) / ball_size;
    float camera_value = simulate_camera(last_frame_pos_relative_to_ball);

    float pos_in_frame = camera_frame - floor(camera_frame);
    if(pos_in_frame > camera_display_strobing){
        camera_value = 0.0;
    }

    vec3 camera_color = linear_to_srgb(vec3(camera_value, 0, 0)) * 0.5;
    vec3 ball_color = vec3(ball_value, ball_value, ball_value) * 0.5;

    // Add alpha and do gamma correction
    color = vec4(camera_color + ball_color, 1.0);
}
