uniform float ball_size;
uniform float camera_brightness;

float simulate_sensor_image(vec2 pos) {
    return 0.0;
}

float simulate_camera(vec2 pos){
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
