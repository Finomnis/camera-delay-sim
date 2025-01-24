use three_d::egui::*;

#[derive(Copy, Clone)]
pub struct SimulatorSettings {
    pub ball_size: f32,
    pub ball_speed: f32,
    pub camera_framerate: u8,
    pub camera_pipeline_delay_ms: u8,
    pub camera_sensor_integration: u8,
    pub camera_display_strobing: u8,
    pub camera_brightness: f32,
}

impl SimulatorSettings {
    pub fn render_gui(&mut self, ui: &mut Ui) {
        ui.heading("Ball Settings");

        ui.add(
            Slider::new(&mut self.ball_size, 0.2..=1.0)
                .text("Size")
                .logarithmic(true),
        );
        ui.add(Slider::new(&mut self.ball_speed, 0.0..=300.0).text("Speed (ball diameters / s)"));

        ui.add_space(12.0);

        ui.heading("Camera Settings");
        ui.add(
            Slider::new(&mut self.camera_brightness, 0.1..=10.0)
                .text("Brightness")
                .logarithmic(true),
        );
        ui.add(Slider::new(&mut self.camera_framerate, 15..=240).text("Framerate (fps)"));
        ui.add(
            Slider::new(&mut self.camera_pipeline_delay_ms, 0..=100).text("Pipeline Delay (ms)"),
        );
        ui.add(
            Slider::new(&mut self.camera_sensor_integration, 0..=100)
                .text("Sensor Integration (% frame)"),
        );
        ui.add(
            Slider::new(&mut self.camera_display_strobing, 0..=100)
                .text("Display Strobing (% frame)"),
        );

        ui.add_space(24.0);
        if ui.button("Reset").clicked() {
            *self = Self::default();
        }
    }
}

impl Default for SimulatorSettings {
    fn default() -> Self {
        Self {
            ball_size: 1.0,
            ball_speed: 50.0,
            camera_framerate: 60,
            camera_pipeline_delay_ms: 0,
            camera_sensor_integration: 100,
            camera_display_strobing: 100,
            camera_brightness: 1.0,
        }
    }
}
