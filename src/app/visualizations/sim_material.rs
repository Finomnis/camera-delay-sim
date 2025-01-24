use three_d::*;

use crate::app::settings::SimulatorSettings;

pub struct SimMaterial {
    fragment_shader: &'static str,
    widget_size: Vec2,
    time: f32,
    material_id: u16,
    settings: SimulatorSettings,
}

impl SimMaterial {
    fn new(fragment_shader: &'static str, material_id: u16, settings: SimulatorSettings) -> Self {
        Self {
            fragment_shader,
            widget_size: Vec2::new(1.0, 1.0),
            time: 0.0,
            material_id,
            settings,
        }
    }

    pub fn ball(settings: SimulatorSettings) -> Self {
        Self::new(include_str!("shaders/sim_ball.frag"), 0b100u16, settings)
    }

    pub fn set_size(&mut self, width: f32, height: f32) {
        self.widget_size.x = width;
        self.widget_size.y = height;
    }

    pub fn set_time(&mut self, time: f32) {
        self.time = time;
    }

    pub fn apply_settings(&mut self, settings: SimulatorSettings) {
        self.settings = settings;
    }
}

impl Material for SimMaterial {
    fn fragment_shader_source(&self, _lights: &[&dyn Light]) -> String {
        format!(
            "{}\n{}",
            include_str!("shaders/sim_common.frag"),
            self.fragment_shader
        )
    }

    fn fragment_attributes(&self) -> FragmentAttributes {
        FragmentAttributes {
            uv: true,
            ..FragmentAttributes::NONE
        }
    }

    fn use_uniforms(&self, program: &Program, _camera: &Camera, _lights: &[&dyn Light]) {
        program.use_uniform_if_required("widget_size", &self.widget_size);
        program.use_uniform_if_required("time", &self.time);
        program.use_uniform_if_required("ball_size", &self.settings.ball_size);
        program.use_uniform_if_required("ball_speed", &self.settings.ball_speed);
        program.use_uniform_if_required("camera_brightness", &self.settings.camera_brightness);
        program.use_uniform_if_required(
            "camera_framerate",
            &f32::from(self.settings.camera_framerate),
        );
        program.use_uniform_if_required(
            "camera_pipeline_delay",
            &(f32::from(self.settings.camera_pipeline_delay_ms) / 1000.0),
        );
        program.use_uniform_if_required(
            "camera_sensor_integration",
            &(f32::from(self.settings.camera_sensor_integration) / 100.0),
        );
        program.use_uniform_if_required(
            "camera_display_strobing",
            &(f32::from(self.settings.camera_display_strobing) / 100.0),
        );
    }

    fn render_states(&self) -> RenderStates {
        RenderStates {
            depth_test: DepthTest::Always,
            write_mask: WriteMask::COLOR,
            cull: Cull::Back,
            blend: Blend::TRANSPARENCY,
            ..Default::default()
        }
    }

    fn material_type(&self) -> MaterialType {
        MaterialType::Transparent
    }

    fn id(&self) -> u16 {
        self.material_id
    }
}
