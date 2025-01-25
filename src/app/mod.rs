use three_d::*;

mod gui;
mod settings;
mod visualizations;

/// Runs a simulation for the given effect/engine
pub fn run() {
    let window = Window::new(WindowSettings {
        title: "Camera Delay Simulator".to_string(),
        max_size: Some((1440, 720)),
        ..Default::default()
    })
    .unwrap();
    let context = window.gl();

    let mut gui = gui::SimulatorGUI::new(&context);
    let mut settings = settings::SimulatorSettings::default();

    let mut ball_sim_widget = visualizations::SimWidget::new(
        &context,
        (0.5, 0.85),
        (0.98, 0.29),
        visualizations::SimMaterial::ball(settings),
    );
    let mut graph_sim_widget = visualizations::SimWidget::new(
        &context,
        (0.25, 0.35),
        (0.48, 0.69),
        visualizations::SimMaterial::graph(settings),
    );
    let mut spinner_sim_widget = visualizations::SimWidget::new(
        &context,
        (0.75, 0.35),
        (0.48, 0.69),
        visualizations::SimMaterial::spinner(settings),
    );

    window.render_loop(move |mut frame_input| {
        let viewport = gui.update(&mut frame_input, &mut settings);

        ball_sim_widget.update(viewport, frame_input.elapsed_time / 1000.0, settings);
        graph_sim_widget.update(viewport, frame_input.elapsed_time / 1000.0, settings);
        spinner_sim_widget.update(viewport, frame_input.elapsed_time / 1000.0, settings);

        frame_input
            .screen()
            .clear(ClearState::color_and_depth(1.0, 0.0, 1.0, 1.0, 1.0))
            .clear_partially(viewport.into(), ClearState::color(0.1, 0.1, 0.1, 1.0))
            .render_partially(
                viewport.into(),
                &Camera::new_2d(viewport),
                &[
                    ball_sim_widget.obj(),
                    graph_sim_widget.obj(),
                    spinner_sim_widget.obj(),
                ],
                &[],
            )
            .write(|| gui.render());

        // Returns default frame output to end the frame
        FrameOutput::default()
    });
}
