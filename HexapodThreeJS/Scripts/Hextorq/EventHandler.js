import { DrawAll, ClearAll } from "./Hextorq.js"
import { Pt } from "./Geometry.js"

export function EventHandlers() {
    $(".AlphaSlider").mousemove(function(e)
    {
        var Value = (parseInt($(this).val(), 10) / 100);
        Pt.A1.X = Value;
        //Pt.A1.Circle.position.set(Pt.A1.X, Pt.A1.Y, Pt.A1.Z);
        //MainScene.

        ClearAll();
        DrawAll();
    })

    $("#toggle-button").on("change", function() {
        const label1Text = $(".toggle-label1").text();
        const label2Text = $(".toggle-label2").text();
        
        if ($(this).is(":checked")) {
            console.log(label2Text);
            $(".LegPatterns").show();
            $(".InverseKinematics").hide();
        } else {
            console.log(label1Text);
            $(".LegPatterns").hide();
            $(".InverseKinematics").show();
            
        }
    });

    $(".AlphaSlider, .BetaSlider, .GammaSlidert, .SmallSlider, #Slider").on("input", function() {
        var sliderValue = $(this).val();
        var spanElement = $(this).siblings("span");
        spanElement.text(sliderValue);
    });

    $(".AlphaSlider, .BetaSlider, .GammaSlider, .SmallSlider").on("input", function() {
        var sliderValue = $(this).val();
        var spanElement = $(this).siblings("span");
        spanElement.text(sliderValue);
    });
}