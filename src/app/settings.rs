use three_d::egui::*;

#[derive(Copy, Clone)]
pub struct SimulatorSettings {
    pub ball_size: f32,
}

impl SimulatorSettings {
    pub fn render_gui(&mut self, ui: &mut Ui) {
        ui.add(
            Slider::new(&mut self.ball_size, 0.2..=1.0)
                .text("Ball Size")
                .logarithmic(true),
        );
    }
}

impl Default for SimulatorSettings {
    fn default() -> Self {
        Self { ball_size: 1.0 }
    }
}
