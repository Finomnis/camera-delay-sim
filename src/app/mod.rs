use three_d::*;

mod gui;
mod settings;
mod visualizations;

/// Runs a simulation for the given effect/engine
pub fn run() {
    let window = Window::new(WindowSettings {
        title: "Camera Delay Simulator".to_string(),
        max_size: Some((1280, 720)),
        ..Default::default()
    })
    .unwrap();
    let context = window.gl();

    let mut gui = gui::SimulatorGUI::new(&context);
    let mut settings = settings::SimulatorSettings::default();

    let mut ball_sim_widget = visualizations::SimWidget::new(
        &context,
        (0.5, 0.25),
        (0.98, 0.49),
        visualizations::SimMaterial::ball(settings),
    );
    window.render_loop(move |mut frame_input| {
        let viewport = gui.update(&mut frame_input, &mut settings);

        ball_sim_widget.update(
            viewport,
            frame_input.accumulated_time as f32 * 1000.0,
            settings,
        );

        frame_input
            .screen()
            .clear(ClearState::color_and_depth(1.0, 0.0, 1.0, 1.0, 1.0))
            .clear_partially(viewport.into(), ClearState::color(0.1, 0.1, 0.1, 1.0))
            .render_partially(
                viewport.into(),
                &Camera::new_2d(viewport),
                &[ball_sim_widget.obj()],
                &[],
            )
            .write(|| gui.render());

        // Returns default frame output to end the frame
        FrameOutput::default()
    });
}
