// Assignment 19: Achroma by Allison Steeves
// Music and sound effects created by Ryan X. Messcher for Achroma: "Achroma" (2019)

// Achroma is an abstract puzzle game with the following features:
// 24 levels with unique zone layouts and player/goal placement.
// Zones are categorized as contiguous beads of the same color and can be one of four shades of gray.
// A player bead (controlled using WASD/arrows) with the following properties:
//    Specific starting color (one of the four shades of gray) depending on level.
//    Takes on the color of the last zone it was in.
//    Cannot move onto beads that are black, white, or its current color.
// Goals designated by a border (either black or white).
// Ability to reset player's position for the current level by pressing the space bar or return key.
// Player bead and goal pulse every 50 frames.
// Fades for level transitions and player bead when the level is restarted.
// An ending sequence that fades in the game's title.
// Two music tracks that play depending on if a level has white walls, black walls, or both.
// Two different victory stingers for reaching a level's goal.
// An error sound effect for when the player tries to move onto a bead that they are not allowed to.
// A "whoosh"-like sound effect for when the player resets the level with space/return.

// Source Code:

// Global namespace variable G

var G = ( function() {

    // Constants

    var GRID_WIDTH = 14; // Width of grid
    var GRID_HEIGHT = 14; // Height of grid

    var BORDER_WIDTH_SMALL = 6; // Width of smallest possible border on beads (also used for player/goal pulses)
    var BORDER_WIDTH_BIG = 8; // Width of largest possible border on beads (used for player/goal pulses)

    var COLOR_LIGHT_GRAY = 0xB4B4B4; // Light gray zone/bead color
    var COLOR_MEDIUM_LIGHT_GRAY = 0x878787; // Medium light gray zone/bead color
    var COLOR_MEDIUM_DARK_GRAY = 0x5A5A5A; // Medium dark gray zone/bead color
    var COLOR_DARK_GRAY = 0x2D2D2D; // Dark gray zone/bead color
    var COLOR_WHITE = 0xFFFFFF; // White wall color
    var COLOR_BLACK = 0x000000; // Black wall color
    var COLOR_BACKGROUND = 0x191919; // Color of grid background (very dark gray)

    var FADE_RATE = 40; // Rate of fades, 40/60ths = 2/3 seconds

    var MUSIC_FADE = 2000; // Rate of music fades during normal level transitions (2 seconds)

    var MUSIC_VOLUME_BLACK = .9; // Music volume for black_id
    var MUSIC_VOLUME_WHITE = 1; // Music volume for white_id
    var SFX_VOLUME = 1; // Sound effect volume

    // Number of first level that has both white and black walls
    var BOTH_WALLS = 18; // Level 18

    // Variables

    var play = true; // True if player can move, false during level transitions and resets, true to start
    var level = 0; // Keeps track of current level (start at Level 0)

    // Movement Variables

    var player_x; // Current x position of player bead
    var player_y; // Current y position of player bead

    var current_color; // Color player bead currently is
    var next_color; // Next color the player bead will be when it changes zones (i.e. color of current zone)
    var last_color; // Color current player bead coordinate will be once the player bead moves

    // Goal Variables

    var goal_x; // Current x position of goal
    var goal_y; // Current y position of goal

    var is_goal = false; // True if player bead is in goal

    var current_border_width = BORDER_WIDTH_SMALL; // Tracks current border width of all beads, small border to start

    // Channel IDs for background music (both are played during levels that have both black and white walls)
    var black_id = ""; // For levels with black walls
    var white_id = ""; // For levels with white walls

    // Booleans that are true if music has been loaded to the correct channel
    var is_black_load = false; // False to start
    var is_white_load = false; // False to start

    // Booleans that are true if music has started playing
    var black_playing = false; // False to start
    var white_playing = false; // False to start

    // Layout for ending screen
    var end_map = [
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
        0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5
    ];

    // Timer for counting frames to pulse player bead and goal
    var pulse_timer = null; // Null to start

    // Timer for ending sequence
    var end_timer = null; // Null to start

    // Counts how many frames have passed since last big border pulse
    var pulse_frames = 0; // 0 to start

    // Counts how many frames have passed since ending sequence started
    var end_frames = 0; // 0 to start

    // Array of objects that contains the initialization data for each level
    // music = string that specifies which music channel(s) should play during the level ("none", "black", "white", or "both")
    // player_x, player_y = starting position of player bead
    // player_color = starting player bead color
    // goal_x, goal_y = position of goal
    // goal_color = color of goal (color the player should be when level is completed)
    // level_map = 14 x 14 array of color layout for each level where:
    // 0 = COLOR_WHITE (impassable walls)
    // 1 = COLOR_LIGHT_GRAY
    // 2 = COLOR_MEDIUM_LIGHT_GRAY
    // 3 = COLOR_MEDIUM_DARK_GRAY
    // 4 = COLOR_DARK_GRAY
    // 5 = COLOR_BLACK (impassable walls)

    var levelData = [

        // Level 0
        {
            music : "none",
            player_x : 2, player_y : 2,
            player_color : COLOR_MEDIUM_DARK_GRAY,
            goal_x : 11, goal_y : 11,
            goal_color : COLOR_BLACK,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ]
        },

        // Level 1
        {
            music : "white",
            player_x : 3, player_y : 10,
            player_color : COLOR_LIGHT_GRAY,
            goal_x : 10, goal_y : 3,
            goal_color : COLOR_BLACK,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 2
        {
            music : "white",
            player_x : 2, player_y : 6,
            player_color : COLOR_LIGHT_GRAY,
            goal_x : 11, goal_y : 6,
            goal_color : COLOR_BLACK,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0,
                0, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0,
                0, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0,
                0, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0,
                0, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0,
                0, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0,
                0, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0,
                0, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0,
                0, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0,
                0, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0,
                0, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0,
                0, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            ]
        },

        // Level 3
        {
            music : "white",
            player_x : 10, player_y : 10,
            player_color : COLOR_MEDIUM_DARK_GRAY,
            goal_x : 2, goal_y : 2,
            goal_color : COLOR_BLACK,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0,
                0, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0,
                0, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0,
                0, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0,
                0, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0,
                0, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0,
                0, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 4
        {
            music : "black",
            player_x : 2, player_y : 3,
            player_color : COLOR_MEDIUM_DARK_GRAY,
            goal_x : 11, goal_y : 10,
            goal_color : COLOR_WHITE,
            level_map : [
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 5,
                5, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 5,
                5, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 5,
                5, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 5,
                5, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 5,
                5, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 5,
                5, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 5,
                5, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 5
        {
            music : "black",
            player_x : 2, player_y : 2,
            player_color : COLOR_LIGHT_GRAY,
            goal_x : 11, goal_y : 11,
            goal_color : COLOR_WHITE,
            level_map : [
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 5,
                5, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 5,
                5, 2, 2, 2, 3, 3, 3, 2, 2, 2, 2, 2, 2, 5,
                5, 2, 2, 2, 3, 3, 3, 1, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 3, 3, 3, 1, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 3, 3, 3, 1, 1, 1, 1, 1, 1, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 6
        {
            music : "black",
            player_x : 12, player_y : 1,
            player_color : COLOR_LIGHT_GRAY,
            goal_x : 2, goal_y : 11,
            goal_color : COLOR_WHITE,
            level_map : [
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 2, 2, 2, 2, 2, 3, 3, 3, 1, 1, 3, 3, 5,
                5, 2, 2, 2, 2, 2, 3, 3, 3, 1, 1, 3, 3, 5,
                5, 3, 3, 1, 1, 1, 3, 3, 3, 1, 1, 3, 3, 5,
                5, 3, 3, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 5,
                5, 3, 3, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 5,
                5, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 3, 3, 5,
                5, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 3, 3, 5,
                5, 1, 1, 1, 3, 3, 3, 3, 2, 2, 2, 3, 3, 5,
                5, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 3, 5,
                5, 1, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 3, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 7
        {
            music : "black",
            player_x : 3, player_y : 2,
            player_color : COLOR_MEDIUM_DARK_GRAY,
            goal_x : 10, goal_y :  2,
            goal_color : COLOR_WHITE,
            level_map : [
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 2, 2, 2, 2, 2, 5, 5, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 5, 5, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 5, 5, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 5, 5, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 5, 5, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 5, 5, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 5, 5, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 5, 5, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 5, 5, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 5, 5, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 5, 5, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 8
        {
            music : "white",
            player_x : 11, player_y : 4,
            player_color : COLOR_MEDIUM_LIGHT_GRAY,
            goal_x : 11, goal_y : 9,
            goal_color : COLOR_BLACK,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
                0, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0,
                0, 3, 3, 3, 3, 3, 3, 3, 0, 3, 3, 3, 3, 0,
                0, 3, 3, 3, 3, 3, 3, 3, 0, 3, 3, 3, 3, 0,
                0, 3, 3, 3, 3, 3, 3, 3, 0, 3, 3, 3, 3, 0,
                0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0,
                0, 3, 3, 3, 3, 3, 3, 3, 0, 3, 3, 3, 3, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 9
        {
            music : "white",
            player_x : 7, player_y : 12,
            player_color : COLOR_MEDIUM_LIGHT_GRAY,
            goal_x : 6, goal_y : 1,
            goal_color : COLOR_BLACK,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 1, 2, 2, 3, 3, 0, 1, 3, 3, 2, 2, 0,
                0, 1, 1, 2, 2, 3, 0, 1, 1, 3, 3, 2, 2, 0,
                0, 1, 1, 2, 2, 0, 2, 1, 1, 3, 3, 2, 2, 0,
                0, 1, 1, 2, 0, 2, 2, 1, 1, 3, 3, 2, 2, 0,
                0, 1, 1, 0, 3, 2, 2, 1, 1, 3, 3, 2, 2, 0,
                0, 1, 0, 3, 3, 2, 2, 1, 1, 3, 3, 2, 2, 0,
                0, 1, 1, 3, 3, 2, 2, 1, 1, 3, 3, 0, 2, 0,
                0, 1, 1, 3, 3, 2, 2, 1, 1, 3, 0, 2, 2, 0,
                0, 1, 1, 3, 3, 2, 2, 1, 1, 0, 1, 2, 2, 0,
                0, 1, 1, 3, 3, 2, 2, 1, 0, 1, 1, 2, 2, 0,
                0, 1, 1, 3, 3, 2, 2, 0, 3, 1, 1, 2, 2, 0,
                0, 1, 1, 3, 3, 2, 0, 3, 3, 1, 1, 2, 2, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 10
        {
            music : "white",
            player_x : 12, player_y : 1,
            player_color : COLOR_MEDIUM_DARK_GRAY,
            goal_x : 8, goal_y : 8,
            goal_color : COLOR_BLACK,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 0,
                0, 1, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 0,
                0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 3, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0,
                0, 1, 3, 0, 2, 3, 3, 3, 3, 3, 3, 3, 1, 0,
                0, 1, 3, 0, 2, 3, 0, 0, 0, 0, 0, 3, 1, 0,
                0, 1, 3, 0, 2, 3, 0, 1, 1, 1, 0, 3, 1, 0,
                0, 2, 1, 0, 2, 3, 3, 1, 1, 1, 0, 3, 1, 0,
                0, 2, 1, 0, 2, 2, 2, 1, 1, 1, 0, 3, 1, 0,
                0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 0,
                0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 0,
                0, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 11
        {
            music : "black",
            player_x : 7, player_y : 11,
            player_color : COLOR_MEDIUM_DARK_GRAY,
            goal_x : 11, goal_y : 2,
            goal_color : COLOR_WHITE,
            level_map : [
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 3, 3, 3, 1, 1, 1, 2, 2, 2, 1, 1, 1, 5,
                5, 3, 3, 5, 1, 1, 1, 3, 3, 3, 1, 1, 1, 5,
                5, 2, 2, 5, 1, 1, 1, 2, 2, 2, 1, 1, 1, 5,
                5, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 5,
                5, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 5,
                5, 2, 2, 2, 2, 3, 3, 2, 2, 3, 3, 3, 3, 5,
                5, 2, 2, 2, 2, 1, 1, 1, 1, 3, 3, 3, 3, 5,
                5, 2, 2, 2, 2, 1, 1, 1, 1, 3, 3, 3, 3, 5,
                5, 2, 2, 2, 2, 1, 1, 1, 1, 3, 3, 3, 3, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 12
        {
            music : "black",
            player_x : 7, player_y : 2,
            player_color : COLOR_DARK_GRAY,
            goal_x : 7, goal_y : 11,
            goal_color : COLOR_WHITE,
            level_map : [
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 5,
                5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5,
                5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5,
                5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5,
                5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5,
                5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5,
                5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5,
                5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5,
                5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5,
                5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 13
        {
          music : "black",
          player_x : 12, player_y : 1,
          player_color : COLOR_LIGHT_GRAY,
          goal_x : 9, goal_y : 4,
          goal_color : COLOR_WHITE,
          level_map : [
              5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
              5, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 4, 4, 5,
              5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 5,
              5, 1, 1, 1, 1, 1, 1, 4, 5, 5, 5, 5, 5, 5,
              5, 1, 1, 1, 1, 1, 1, 4, 5, 4, 4, 3, 3, 5,
              5, 1, 1, 1, 1, 1, 1, 4, 5, 4, 4, 2, 2, 5,
              5, 2, 2, 2, 2, 2, 2, 4, 5, 5, 5, 2, 2, 5,
              5, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 5,
              5, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 1, 5,
              5, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 1, 5,
              5, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 1, 5,
              5, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 1, 5,
              5, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 1, 5,
              5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
          ]
        },

        // Level 14
        {
            music : "white",
            player_x : 11, player_y : 11,
            player_color : COLOR_LIGHT_GRAY,
            goal_x : 2, goal_y : 2,
            goal_color : COLOR_BLACK,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0,
                0, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0,
                0, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0,
                0, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0,
                0, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0,
                0, 4, 4, 4, 2, 2, 1, 1, 1, 1, 4, 4, 4, 0,
                0, 4, 4, 4, 2, 2, 1, 1, 1, 1, 4, 4, 4, 0,
                0, 4, 4, 4, 2, 2, 1, 1, 1, 1, 4, 4, 4, 0,
                0, 4, 4, 4, 2, 2, 1, 1, 1, 1, 4, 4, 4, 0,
                0, 4, 4, 4, 2, 2, 3, 3, 3, 3, 2, 2, 2, 0,
                0, 4, 4, 4, 2, 2, 3, 3, 3, 3, 2, 2, 2, 0,
                0, 4, 4, 4, 2, 2, 3, 3, 3, 3, 2, 2, 2, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 15
        {
            music : "white",
            player_x : 1, player_y : 12,
            player_color : COLOR_MEDIUM_LIGHT_GRAY,
            goal_x : 11, goal_y : 2,
            goal_color : COLOR_BLACK,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 1, 1, 1, 1, 1, 2, 2, 4, 4, 1, 1, 1, 0,
                0, 4, 4, 4, 4, 4, 2, 2, 4, 4, 1, 1, 1, 0,
                0, 4, 4, 4, 4, 4, 2, 2, 4, 4, 1, 1, 1, 0,
                0, 1, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 0,
                0, 1, 1, 1, 1, 1, 3, 3, 2, 2, 3, 3, 3, 0,
                0, 1, 1, 1, 1, 1, 3, 3, 2, 2, 1, 1, 1, 0,
                0, 4, 4, 2, 2, 2, 2, 2, 3, 3, 1, 1, 1, 0,
                0, 4, 4, 2, 2, 2, 2, 2, 3, 3, 1, 1, 1, 0,
                0, 4, 4, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 0,
                0, 4, 4, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 0,
                0, 1, 1, 3, 3, 3, 3, 4, 4, 2, 2, 2, 2, 0,
                0, 1, 1, 3, 3, 3, 3, 4, 4, 2, 2, 2, 2, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 16
        {
            music : "black",
            player_x : 8, player_y : 6,
            player_color : COLOR_LIGHT_GRAY,
            goal_x : 5, goal_y : 6,
            goal_color : COLOR_WHITE,
            level_map : [
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 1, 1, 2, 2, 2, 5, 5, 1, 1, 1, 2, 2, 5,
                5, 1, 1, 2, 2, 2, 5, 5, 1, 1, 1, 2, 2, 5,
                5, 1, 1, 3, 3, 3, 5, 5, 4, 4, 4, 2, 2, 5,
                5, 1, 1, 3, 3, 3, 5, 5, 4, 4, 4, 2, 2, 5,
                5, 1, 1, 4, 4, 4, 5, 5, 3, 3, 3, 2, 2, 5,
                5, 1, 1, 4, 3, 3, 5, 5, 4, 4, 3, 2, 2, 5,
                5, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 5,
                5, 1, 1, 5, 5, 5, 5, 5, 5, 5, 5, 2, 2, 5,
                5, 1, 1, 4, 4, 2, 2, 1, 1, 3, 3, 2, 2, 5,
                5, 1, 1, 4, 4, 2, 2, 1, 1, 3, 3, 2, 2, 5,
                5, 1, 1, 4, 4, 2, 2, 1, 1, 3, 3, 2, 2, 5,
                5, 1, 1, 4, 4, 2, 2, 1, 1, 3, 3, 2, 2, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 17
        {
            music : "black",
            player_x : 12, player_y : 12,
            player_color : COLOR_MEDIUM_DARK_GRAY,
            goal_x : 1, goal_y : 1,
            goal_color : COLOR_WHITE,
            level_map : [
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 2, 2, 2, 4, 4, 4, 4, 1, 1, 3, 3, 3, 5,
                5, 2, 2, 2, 4, 4, 4, 4, 1, 1, 3, 3, 3, 5,
                5, 2, 2, 2, 4, 4, 4, 4, 1, 1, 3, 3, 3, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 1, 3, 5, 5, 5,
                5, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 5,
                5, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5,
                5, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5,
                5, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5,
                5, 5, 5, 1, 2, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                5, 1, 1, 1, 2, 2, 4, 4, 4, 4, 4, 4, 4, 5,
                5, 1, 1, 1, 2, 2, 4, 4, 4, 4, 4, 4, 4, 5,
                5, 1, 1, 1, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5,
                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 18
        {
            music : "both",
            player_x : 1, player_y : 12,
            player_color : COLOR_DARK_GRAY,
            goal_x : 12, goal_y : 1,
            goal_color : COLOR_WHITE,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 2, 2, 2, 2, 4, 0, 5, 2, 2, 2, 2, 2, 5,
                0, 2, 1, 1, 1, 4, 3, 2, 1, 1, 1, 1, 1, 5,
                0, 2, 1, 3, 2, 4, 3, 2, 2, 2, 2, 2, 3, 5,
                0, 2, 1, 3, 2, 4, 3, 3, 4, 4, 4, 4, 3, 5,
                0, 4, 4, 3, 2, 4, 2, 1, 2, 1, 1, 1, 1, 5,
                0, 4, 1, 3, 2, 3, 2, 1, 2, 4, 4, 4, 4, 5,
                0, 4, 1, 3, 2, 3, 2, 1, 1, 3, 3, 2, 2, 5,
                0, 2, 1, 3, 2, 3, 2, 2, 2, 2, 1, 1, 2, 5,
                0, 2, 1, 2, 2, 3, 3, 3, 3, 4, 3, 1, 4, 5,
                0, 2, 1, 1, 1, 4, 4, 4, 4, 4, 3, 1, 4, 5,
                0, 2, 2, 3, 3, 3, 3, 2, 2, 3, 3, 1, 4, 5,
                0, 1, 1, 1, 1, 1, 0, 5, 2, 2, 2, 4, 4, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 19
        {
            music : "both",
            player_x : 8, player_y : 2,
            player_color : COLOR_MEDIUM_DARK_GRAY,
            goal_x : 3, goal_y : 8,
            goal_color : COLOR_BLACK,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 3, 2, 2, 2, 2, 5, 2, 2, 2, 1, 5, 5,
                0, 0, 3, 2, 2, 2, 2, 5, 2, 2, 2, 1, 5, 5,
                0, 0, 1, 1, 1, 2, 2, 5, 4, 4, 4, 1, 5, 5,
                0, 0, 3, 2, 1, 2, 2, 5, 5, 5, 4, 1, 5, 5,
                0, 0, 3, 2, 1, 2, 4, 4, 4, 5, 4, 1, 5, 5,
                0, 0, 1, 1, 0, 3, 1, 1, 1, 5, 4, 1, 5, 5,
                0, 0, 2, 2, 0, 3, 1, 5, 5, 5, 4, 2, 5, 5,
                0, 0, 0, 0, 0, 3, 1, 4, 4, 4, 4, 2, 5, 5,
                0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 5, 5,
                0, 0, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 20
        {
            music : "none",
            player_x : 3, player_y : 10,
            player_color : COLOR_LIGHT_GRAY,
            goal_x : 10, goal_y : 3,
            goal_color : COLOR_WHITE,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 2, 2, 2, 2, 1, 1, 1, 1, 5, 5, 5,
                0, 0, 0, 2, 2, 2, 2, 1, 1, 1, 1, 5, 5, 5,
                0, 0, 0, 2, 2, 2, 5, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 2, 2, 2, 2, 3, 3, 3, 3, 5, 5, 5,
                0, 0, 0, 2, 2, 2, 2, 3, 3, 3, 3, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 5, 5, 5,
                0, 0, 0, 4, 4, 4, 4, 4, 3, 3, 3, 5, 5, 5,
                0, 0, 0, 4, 4, 4, 4, 4, 3, 3, 3, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 21
        {
            music : "none",
            player_x : 9, player_y : 9,
            player_color : COLOR_LIGHT_GRAY,
            goal_x : 4, goal_y : 4,
            goal_color : COLOR_BLACK,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 5, 5, 5, 5,
                0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 5, 5, 5, 5,
                0, 0, 0, 0, 1, 2, 2, 3, 3, 3, 5, 5, 5, 5,
                0, 0, 0, 0, 2, 2, 3, 3, 3, 4, 5, 5, 5, 5,
                0, 0, 0, 0, 2, 3, 3, 3, 4, 4, 5, 5, 5, 5,
                0, 0, 0, 0, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 22
        {
            music : "none",
            player_x : 5, player_y : 6,
            player_color : COLOR_DARK_GRAY,
            goal_x : 8, goal_y : 7,
            goal_color : COLOR_WHITE,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5
            ]
        },

        // Level 23
        {
            music : "none",
            player_x : 6, player_y : 7,
            player_color : COLOR_DARK_GRAY,
            goal_x : 7, goal_y : 7,
            goal_color : COLOR_WHITE,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 2, 3, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 1, 4, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5,
                0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5, 5, 5, 5
            ]
        }
    ];

    // Set up the zones for the specific level
    function colorMap( map ) {
        var x, y, num;

        // Give all beads border to match their color
        PS.border( PS.ALL, PS.ALL, current_border_width );

        // Color each bead and bead border on grid according to map array
        for ( y = 0; y < GRID_HEIGHT; y += 1 ) {
            for ( x = 0; x < GRID_WIDTH; x += 1 ) {
                num = map[ ( y * GRID_WIDTH ) + x ]; // Get array number from position
                if ( num === 0 ) {
                    PS.color( x, y, COLOR_WHITE ); // 0 = COLOR_WHITE
                    PS.borderColor( x, y, COLOR_WHITE );
                } else if ( num === 1 ) {
                    PS.color( x, y, COLOR_LIGHT_GRAY ); // 1 = COLOR_LIGHT_GRAY
                    PS.borderColor( x, y, COLOR_LIGHT_GRAY );
                } else if ( num === 2 ) {
                    PS.color( x, y, COLOR_MEDIUM_LIGHT_GRAY ); // 2 = COLOR_MEDIUM_LIGHT_GRAY
                    PS.borderColor( x, y, COLOR_MEDIUM_LIGHT_GRAY );
                } else if ( num === 3 ) {
                    PS.color( x, y, COLOR_MEDIUM_DARK_GRAY ); // 3 = COLOR_MEDIUM_DARK_GRAY
                    PS.borderColor( x, y, COLOR_MEDIUM_DARK_GRAY );
                } else if ( num === 4 ) {
                    PS.color( x, y, COLOR_DARK_GRAY ); // 4 = COLOR_DARK_GRAY
                    PS.borderColor( x, y, COLOR_DARK_GRAY );
                } else if ( num === 5 ) {
                    PS.color( x, y, COLOR_BLACK ); // 5 = COLOR_BLACK
                    PS.borderColor( x, y, COLOR_BLACK );
                }
            }
        }
    }

    // Place player bead at correct coordinate with correct color
    function placePlayer( px, py, pcolor, numcolor ) {

        // Save player bead's current location
        player_x = px;
        player_y = py;

        // Save player bead starting color variables
        current_color = pcolor; // Current color is player bead starting color

        // Next and last color are one of the four shades of gray (default color of coordinate player bead starts on)
        if ( numcolor === 1 ) {
            next_color = COLOR_LIGHT_GRAY;
            last_color = COLOR_LIGHT_GRAY;
        } else if ( numcolor === 2 ) {
            next_color = COLOR_MEDIUM_LIGHT_GRAY;
            last_color = COLOR_MEDIUM_LIGHT_GRAY;
        } else if ( numcolor === 3 ) {
            next_color = COLOR_MEDIUM_DARK_GRAY;
            last_color = COLOR_MEDIUM_DARK_GRAY;
        } else if ( numcolor === 4 ) {
            next_color = COLOR_DARK_GRAY;
            last_color = COLOR_DARK_GRAY;
        }

        // Place player bead
        PS.color( px, py, pcolor );
    }

    // Set up goal designated by border
    function setGoal( gx, gy, gcolor ) {

        // Save goal coordinate
        goal_x = gx;
        goal_y = gy;

        // Set goal (border with correct color)
        PS.border( gx, gy, current_border_width );
        PS.borderColor( gx, gy, gcolor );
    }

    // Fades in/out music channels based on level
    function fadeMusic ( music ) {

        if ( music === "black" ) {
            PS.audioFade( white_id, PS.CURRENT, 0, MUSIC_FADE ); // Fade out white_id
            PS.audioFade( black_id, PS.CURRENT, MUSIC_VOLUME_BLACK, MUSIC_FADE ); // Fade in black_id
        } else if ( music === "white" ) {
            PS.audioFade( black_id, PS.CURRENT, 0, MUSIC_FADE ); // Fade out black_id
            PS.audioFade( white_id, PS.CURRENT, MUSIC_VOLUME_WHITE, MUSIC_FADE ); // Fade in white_id
        } else if ( music === "both" ) {
            PS.audioFade( white_id, PS.CURRENT, MUSIC_VOLUME_WHITE, MUSIC_FADE ); // Fade in white_id
            PS.audioFade( black_id, PS.CURRENT, MUSIC_VOLUME_BLACK, MUSIC_FADE ); // Fade in black_id
        } else if ( music === "none" ) {
            PS.audioFade( white_id, PS.CURRENT, 0, 10000 ); // Fade out white_id over 10 seconds
            PS.audioFade( black_id, PS.CURRENT, 0, 10000 ); // Fade out black_id over 10 seconds
        }

    }

    // Start the specified level
    function startLevel( val ) {
        var data, px, py, num;

        level = val;

        // Initialize level from data
        data = levelData[ level ];

        px = data.player_x;
        py = data.player_y;

        // If not first level (Level 0), turn on fades for level transitions
        if ( level !== 0 ) {
            PS.fade( PS.ALL, PS.ALL, FADE_RATE );
            PS.borderFade( PS.ALL, PS.ALL, FADE_RATE );

            // Set play to true when player bead color is done fading in
            PS.fade( px, py, FADE_RATE, { onEnd: playTrue } );
        }

        // Color map (zones and walls)
        colorMap( data.level_map );

        // Get number for color of bead where player bead will be
        num = data.level_map[ ( py * GRID_WIDTH ) + px ];

        // Set up goal
        setGoal( data.goal_x, data.goal_y, data.goal_color );

        // Place player bead
        placePlayer( px, py, data.player_color, num );

        // If second level (Level 1) or later and music is loaded but not playing, start playing both channels at 0 volume
        if ( ( level >= 1 ) && is_black_load && is_white_load && !black_playing && !white_playing ) {
            PS.audioPlayChannel( black_id, { volume : 0, loop : true } );
            PS.audioPlayChannel( white_id, { volume : 0, loop : true } );

            // Set music playing variables to true
            black_playing = true;
            white_playing = true;
        }

        // If not first level (Level 0) and music is loaded/playing, fade in/out music based on which channels should be playing
        if ( ( level !== 0 ) && is_black_load && is_white_load && black_playing && white_playing ) {
            fadeMusic( data.music );
        }
    }

    // Play victory stinger for level
    function playVictory() {

        // If level has both black and white walls, play "dun" sound instead of normal victory stinger
        if ( level < BOTH_WALLS ) {
            PS.audioPlay( "victory_stinger_01", { path : "sounds/", lock : true, volume : SFX_VOLUME } );
        } else if ( level >= BOTH_WALLS ) {
            PS.audioPlay( "victory_stinger_02", { path : "sounds/", lock : true, volume : SFX_VOLUME } );
        }

    }

    // Sets play variable to true
    function playTrue() {
        play = true;
    }

    // Sets play variable to false
    function playFalse() {
        play = false;
    }

    // Loader function to save channel ID for music (black)
    function musicBlackLoader( data ) {
        black_id = data.channel; // Save ID
        is_black_load = true; // Set to true
    }

    // Loader function to save channel ID for music (white)
    function musicWhiteLoader( data ) {
        white_id = data.channel; // Save ID
        is_white_load = true; // Set to true
    }

    // Resets map, player bead, and goal of current level
    function resetLevel() {
        var data, px, py, num;

        // Initialize level from data
        data = levelData[ level ];

        px = data.player_x;
        py = data.player_y;

        // Turn on fades
        PS.fade( PS.ALL, PS.ALL, FADE_RATE );
        PS.borderFade( PS.ALL, PS.ALL, FADE_RATE );

        // Set play to true when player bead color is done fading in
        PS.fade( px, py, FADE_RATE, { onEnd: playTrue } );

        // Color map
        colorMap( data.level_map );

        // Get number for color of bead where player bead will be
        num = data.level_map[ ( py * GRID_WIDTH ) + px ];

        // Place player bead
        placePlayer( px, py, data.player_color, num );

        // Set up goal
        setGoal( data.goal_x, data.goal_y, data.goal_color );
    }

    // Tick function called on every frame
    // Changes the border width of all beads to make player bead and goal appear to pulse
    function pulseTick() {

        // Only add to pulseFrames if play is true
        if ( play === true ) {

            // Add one to pulseFrames
            pulse_frames += 1;

            // After 50 frames, change borders to bigger width so player bead/goal pulses
            if ( pulse_frames === 50 ) {
                PS.border( PS.ALL, PS.ALL, BORDER_WIDTH_BIG ); // Make border on all beads bigger
                current_border_width = BORDER_WIDTH_BIG; // Keep track of current border width
            }

            // After 100 frames, change borders to smaller width so player bead/goal pulses and then reset pulseFrames
            if ( pulse_frames === 100 ) {
                PS.border( PS.ALL, PS.ALL, BORDER_WIDTH_SMALL ); // Make border on all beads smaller
                pulse_frames = 0; // Reset pulseFrames
                current_border_width = BORDER_WIDTH_SMALL; // Keep track of current border width size
            }
        }
    }

    // Set up ending sequence and start end_timer
    function startEnd() {

        // Turn on fades for all beads and set play to false
        PS.fade( PS.ALL, PS.ALL, FADE_RATE, { onEnd : playFalse } );
        PS.borderFade( PS.ALL, PS.ALL, FADE_RATE );

        // Set all beads to end_map layout
        colorMap( end_map );

        // Stop pulse_timer
        PS.timerStop( pulse_timer );

        // Start end_timer
        end_timer = PS.timerStart( 1, endTick );
    }

    // Fades in title and fades out music after 2 seconds and plays ending swell
    function endTick() {

        // Add 1 to endFrames
        end_frames += 1;

        // After 2 seconds, start fading in title/play ending swell and stop timer
        if ( end_frames === 120 ) {
            PS.statusFade( 300 ); // Fade in text over 5 seconds
            PS.statusColor( COLOR_LIGHT_GRAY ); // Fade text to light gray and make visible
            PS.audioPlay( "end_01", { path : "sounds/", lock : true, volume : SFX_VOLUME } ); // Play swell
            PS.timerStop( end_timer ); // Stop end_timer
        }

    }

    // Functions accessible outside of G function
    var exports = {

        // G.init()
        // Initializes the game
        init : function () {
            "use strict";

            PS.gridSize( GRID_WIDTH, GRID_HEIGHT ); // Dimensions of grid, 14 x 14
            PS.gridColor( COLOR_BACKGROUND ); // Background color (very dark gray)
            PS.gridShadow( true, COLOR_MEDIUM_LIGHT_GRAY ); // Grid shadow = medium light gray
            PS.statusText( "Achroma" ); // Status line text
            PS.statusColor( COLOR_BACKGROUND ); // Status line color not visible against background (until end)

            // Load black and white music tracks to different channels
            PS.audioLoad( "barrier_01", {
                lock : true,
                onLoad : musicWhiteLoader,
                path : "sounds/"
            } );

            PS.audioLoad( "barrier_02", {
                lock : true,
                onLoad : musicBlackLoader,
                path : "sounds/"
            } );

            // Start pulse_timer to pulse player bead and goal
            pulse_timer = PS.timerStart( 1, pulseTick );

            // Start first level (Level 0)
            startLevel( level );
        },

        // G.move( h, v )
        // Move player bead
        move: function ( h, v ) {
            var nx, ny, len;

            // Can only move if play variable is true
            if ( play === true ) {

                // Turn off fades for player movement
                PS.fade( PS.ALL, PS.ALL, 0 );
                PS.borderFade( PS.ALL, PS.ALL, 0 );

                // Calculate proposed new location
                nx = player_x + h;
                ny = player_y + v;

                // If the bead there is COLOR_BLACK, COLOR_WHITE, or current_color, exit without moving and play error sound
                if ( ( PS.color( nx, ny ) === COLOR_BLACK )
                    || ( PS.color( nx, ny ) === COLOR_WHITE )
                    || ( PS.color( nx, ny ) === current_color ) ) {
                    PS.audioPlay( "error_01", { path : "sounds/", lock : true, volume : SFX_VOLUME } );
                    return;
                }

                // Legal move, so change current player bead location to its original color
                PS.color( player_x, player_y, last_color );

                // Remember color of new bead location before player bead moves there
                last_color = PS.color( nx, ny );

                // If last_color does not equal next_color (i.e. player moves into new zone) do the following in order:
                // 1. Place player bead in new location as next_color
                // 2. Change current_color to next_color
                // 3. Change next_color to last_color (color of bead player just replaced)
                // Otherwise, place player bead in new location as current_color and don't update color variables
                if ( last_color !== next_color ) {
                    PS.color( nx, ny, next_color );
                    current_color = next_color;
                    next_color = last_color;
                } else {
                    PS.color( nx, ny, current_color );
                }

                // Update player bead's position
                player_x = nx;
                player_y = ny;

                // If new location is goal, set is_goal to true, else false
                if ( ( player_x === goal_x ) && ( player_y === goal_y ) ) {
                    is_goal = true;
                } else {
                    is_goal = false;
                }

                // Go to next level if goal has been reached
                if ( is_goal === true ) {

                    // Set goal boolean to false
                    is_goal = false;

                    // Set play to false (player can no longer move)
                    playFalse();

                    // Play victory sound for reaching goal
                    playVictory();

                    len = levelData.length; // Check number of levels

                    // If last level, start ending sequence
                    if ( ( level + 1 ) === len ) {
                        startEnd();
                    } else {

                        // Add one to current level
                        level += 1;

                        // Start next level
                        startLevel( level );
                    }
                }
            }
        },

        // G.reset()
        // Reset player bead to starting position and color
        reset: function () {

            // Can only reset if play is true
            if ( play === true ) {

                // Play "whoosh" sound effect
                PS.audioPlay( "reset_01", { path : "sounds/", lock : true, volume : SFX_VOLUME } );

                // Set play to false
                playFalse();

                // Reset the level
                resetLevel();
            }
        }
    };

    return exports;

} () );


PS.init = function( system, options ) {
    "use strict";

    G.init();
};

PS.touch = function( x, y, data, options ) {
    "use strict";
};

PS.release = function( x, y, data, options ) {
    "use strict";
};

PS.enter = function( x, y, data, options ) {
    "use strict";
};

PS.exit = function( x, y, data, options ) {
    "use strict";
};


PS.exitGrid = function( options ) {
    "use strict";
};

PS.keyDown = function( key, shift, ctrl, options ) {
    "use strict";

    switch ( key ) {
        case PS.KEY_ARROW_UP:
        case 119:
        case 87: {
            G.move( 0, -1 ); // Move UP ( v = -1 )
            break;
        }

        case PS.KEY_ARROW_DOWN:
        case 115:
        case 83: {
            G.move( 0, 1 ); // Move DOWN ( v = 1 )
            break;
        }

        case PS.KEY_ARROW_LEFT:
        case 97:
        case 65: {
            G.move( -1, 0 ); // Move LEFT ( h = -1 )
            break;
        }

        case PS.KEY_ARROW_RIGHT:
        case 100:
        case 68: {
            G.move( 1, 0 ); // Move RIGHT ( h = 1 )
            break;
        }

        case 32:
        case 13: {
            G.reset();
            break;
        }
    }
};

PS.keyUp = function( key, shift, ctrl, options ) {
    "use strict";
};

PS.input = function( sensors, options ) {
    "use strict";
};

PS.shutdown = function( options ) {
    "use strict";
};
