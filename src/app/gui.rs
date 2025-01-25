use super::settings::SimulatorSettings;

pub struct SimulatorGUI {
    gui: three_d::GUI,
}

impl SimulatorGUI {
    pub fn new(context: &three_d::Context) -> Self {
        Self {
            gui: three_d::GUI::new(&context),
        }
    }

    pub fn update(
        &mut self,
        frame_input: &mut three_d::FrameInput,
        settings: &mut SimulatorSettings,
    ) -> three_d::Viewport {
        let mut panel_width = 0.0;

        self.gui.update(
            &mut frame_input.events,
            frame_input.accumulated_time,
            frame_input.viewport,
            frame_input.device_pixel_ratio,
            |gui_context| {
                use three_d::egui::*;
                SidePanel::left("side_panel").show(gui_context, |ui| {
                    settings.render_gui(ui);

                    ui.add_space(24.0);
                    ui.heading("Explanation");
                    ui.label("This program simulates how a mixed-reality video stream on a translucent display would look, \
                                    based on various image pipeline parameters.");
                    ui.label("The top visualization simulates how it would look like if you had a moving object in a steady display, \
                                    while the eyes of the observer looking through the display follow the moving object.");
                    ui.label("The bottom left visualization simulates how in the same scenario, the middle row of the display would look \
                                    like, over time. The horizontal axis represents time, while the vertical axis represents the \
                                    pixels of the display (in red). The actual ball is also shown, for reference (in white).");
                    ui.label("The bottom right visualization shows how a moving object in a stationary camera looks, in slow motion.");
                });
                panel_width = gui_context.used_rect().width();
            },
        );

        three_d::Viewport {
            x: (panel_width * frame_input.device_pixel_ratio) as i32,
            y: 0,
            width: frame_input
                .viewport
                .width
                .saturating_sub((panel_width * frame_input.device_pixel_ratio) as u32),
            height: frame_input.viewport.height,
        }
    }

    pub fn render(&self) {
        self.gui.render();
    }
}
