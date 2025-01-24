uniform float ball_size;
uniform float ball_speed;
uniform float camera_brightness;
uniform float camera_framerate;
uniform float camera_pipeline_delay;
uniform float camera_sensor_integration;
uniform float camera_display_strobing;

float simulate_camera(vec2 pixel_pos){
    float ball_squared = (1 + pixel_pos.y) * (1 - pixel_pos.y);
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

    float camera_curve_rise_time = min(ball_size, integration_distance_sensor);
    float camera_curve_p0 = ball_start + integration_offset_sensor;
    float camera_curve_p1 = camera_curve_p0 + camera_curve_rise_time;
    float camera_curve_p3 = ball_end + integration_offset_sensor + integration_distance_sensor;
    float camera_curve_p2 = camera_curve_p3 - camera_curve_rise_time;

    if (pos < camera_curve_p0) {
        return 0.0;
    }
    if (pos < camera_curve_p1) {
        return 0.25;
    }
    if (pos < camera_curve_p2) {
        return 0.5;
    }
    if (pos < camera_curve_p3) {
        return 0.75;
    }

    return 1.0;
}

void main()
{
    vec2 pixel_pos = widget_size * uvs;

    float ball_diameter_pixels = widget_size.y/4 * ball_size;

    vec2 rel_pos = (vec2(ball_diameter_pixels * 2., widget_size.y/2.) - pixel_pos) / ball_diameter_pixels;
    float rel_dist = length(rel_pos);

    float camera_value = simulate_camera(rel_pos);
    float ball_value = 0.0;
    if(rel_dist <= 1.0){
        ball_value = 1.0;
    }

    vec3 camera_color = linear_to_srgb(vec3(camera_value, 0, 0)) * 0.5 * camera_brightness;
    vec3 ball_color = vec3(ball_value, ball_value, ball_value) * 0.5;

    // Add alpha and do gamma correction
    color = vec4(camera_color + ball_color, 1.0);
}
