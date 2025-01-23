void main()
{
    vec2 pixel_pos = widget_size * uvs;
    vec2 pixel_size = 1.0 / widget_size;

    vec2 rel_pos = vec2(widget_size.x/2., 0.) - pixel_pos;
    float rel_dist = length(rel_pos) / 1000.0;

    vec3 linear_color = vec3(rel_dist, rel_dist, rel_dist);

    // Add alpha and do gamma correction
    color = vec4(linear_to_srgb(linear_color), 1.0);
}
