// Assignment 13: Blink (Polished) by Allison Steeves
// Music created by Ryan X. Messcher for Blink: "Omniscient" and "Pansophy" (2019).
// Voice acting provided by Ryan X. Messcher.

// Each Blink puzzle is made up of the following components:
// Two planes (dark and light) each with a unique wall layout.
// Two player beads (dark and light) that player can control one at a time (depending on active layer) with WASD/arrows.
// Separate goals for each color bead on different planes, designated by bead border of same color.
// Walls that are impassable by player bead of the same color.
// Walls can be cancelled out by the bead of the opposite color standing where the wall would be on the opposite layer.
// Timer that switches between the two planes every 5.5 seconds and plays an associated breath-like sound effect.
// Music that changes  depending on which plane is active.
// An ambient hum that increases in volume when a player bead is currently cancelling out a wall.
// A unique line of dialogue that plays at the start of each level.
// Animations for eye sprite opening and closing during plane transitions.
// Decrease/Increase of transparencies of each plane during plane transitions.

// There are a total of 17 Blink puzzles with the following breakdown:
// 2 Tutorials
// 5 Easy Puzzles
// 5 Medium Puzzles
// 5 Hard Puzzles
// Each load of the game will have the 2 tutorials, 1 random easy puzzle, 1 random medium puzzle, and 1 random hard puzzle (in that order).
// Blink also features an intro and ending sequence with dialogue and animation.

// Source Code:

// Global namespace variable G

var G = ( function() {

    // Constants

    var GRID_WIDTH = 32; // Width of grid
    var GRID_HEIGHT = 32; // Height of grid

    var GOAL_WIDTH_BORDER = 1; // Width of bead border on goal beads

    var COLOR_LIGHT = 0xF2F2F2; // Color of light beads, walls, and backgrounds (white)
    var COLOR_DARK = 0x404040; // Color of dark beads, walls, and backgrounds (dark gray)
    var COLOR_IMPASSABLE = 0x0D0D0D; // Color of impassable beads (black)
    var COLOR_BACKGROUND = 0x737373; // Color of grid background (gray)

    var PLANE_LIGHT = 1; // Light layer that holds all dark elements
    var PLANE_DARK = 2; // Dark layer that holds all light elements
    var PLANE_SPRITE = 3; // Sprite layer for eye animation

    var IS_WALL_DARK = "dark wall"; // Dark wall ID
    var IS_WALL_LIGHT = "light wall"; // Light wall ID
    var NOT_WALL = "not wall"; // Not wall ID

    // Coordinates for eye sprites (top left corner)
    var SPRITE_X = 0; // X-value
    var SPRITE_Y = 0; // Y-value

    var FRAME_NUMBER = 330; // 330 frames (5.5 seconds) to start

    // Sound Volumes
    var MUSIC_VOLUME = .25; // Music volume
    var DRONE_VOLUME = .15; // Drone volume
    var SFX_VOLUME = .4; // Sound effect volume
    var DIALOGUE_VOLUME = 1; // Dialogue volume

    // Variables

    // Sprite id for loading in eye sprites
    var sprite_id;

    // Channel ids for background music and ambient drone
    var closed_id = "";
    var open_id = "";
    var drone_id = "";

    // Timer for calling tick function on every frame
    var tickTimer = null; // Null to start

    // Timer for animation for opening sequence
    var openTimer = null; // Null to start

    // Timer for animation for closing sequence
    var closeTimer = null; // Null to start

    // Timer for playing level dialogue
    var dialogueTimer = null; // Null to start

    // Determines if tickTimer will count frames
    var play = false;

    // True if it's the start of the game (true to start)
    var beginning = true;

    // True if it's the end of the game (false to start)
    var end = false;

    // Counts how many frames have passed since active plane was changed
    var frameCount = 0; // 0 to start

    // Player bead position variables

    var light_x; // Current x position of light player bead
    var light_y; // Current y position of light player bead
    var dark_x; // Current x position of dark player bead
    var dark_y; // Current y position of dark player bead

    // Position of color goal beads

    var light_goal_x; // X position of light goal bead
    var light_goal_y; // Y position of light goal bead
    var dark_goal_x; // X position of dark goal bead
    var dark_goal_y; // Y position of dark goal bead

    // Booleans for if player beads are at respective goal
    var is_dark_goal = false; // True if dark player bead is in dark goal
    var is_light_goal = false; // True if light player bead is in light goal

    // Remember colors of last bead for movement purposes

    var light_last_color = COLOR_DARK; // Remembers last color of bead light player bead is currently on
    var dark_last_color = COLOR_LIGHT; // Remembers last color of bead dark player bead is currently on

    // Current level
    var level = 0; // Starts at Level 0 (Tutorial)

    // Array of objects that contains the initialization data for each level
    // line_string = string of the dialogue line name to be played at start of the level
    // line_obj = object with PS.audioPlay parameters for the dialogue line
    // light_x, light_y = starting position of light player bead
    // dark_x, dark_y = starting position of dark player bead
    // light_goal_x, light_goal_y = position of light goal
    // dark_goal_x, dark_goal_y = position of dark goal
    // (optional) light_walls = list of light wall coordinates on dark layer [ x, y ]
    // (optional) dark_walls = list of dark wall coordinates on light layer [ x, y ]
    // (optional) difficulty = string categorizing the difficulty of the puzzle (easy, medium, or hard)

    var levelData = [

        // Level 0 - Tutorial: only goals, no walls
        {
            line_string : "line_tutorial_01",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 29, light_y : 2,
            dark_x : 2, dark_y : 29,
            light_goal_x : 2, light_goal_y : 29,
            dark_goal_x : 29, dark_goal_y : 2
        },

        // Level 1 - Tutorial: only dark walls
        {
            line_string : "line_tutorial_02",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 25, light_y : 3,
            dark_x : 3, dark_y : 25,
            light_goal_x : 3, light_goal_y : 25,
            dark_goal_x : 25, dark_goal_y : 3,
            dark_walls : [
                [ 18, 1 ], [ 18, 2 ], [ 18, 3 ], [ 18, 4 ], [ 18, 5 ], [ 18, 6 ], [ 18, 7 ], [ 18, 8 ], [ 18, 22 ],
                [ 18, 23 ], [ 18, 24 ], [ 18, 25 ], [ 18, 26 ], [ 18, 27 ], [ 18, 28 ], [ 18, 29 ], [ 18, 30 ]
            ]
        },

        // Level 2 - Easy
        {
            line_string : "line_easy_01",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 3, light_y : 26,
            dark_x : 5, dark_y : 28,
            light_goal_x : 25, light_goal_y : 4,
            dark_goal_x : 27, dark_goal_y : 6,
            light_walls : [
                [ 13, 1 ], [ 13, 2 ], [ 13, 3 ], [ 13, 4 ], [ 13, 5 ], [ 13, 6 ], [ 13, 7 ], [ 13, 8 ], [ 18, 22 ],
                [ 18, 23 ], [ 18, 24 ], [ 18, 25 ], [ 18, 26 ], [ 18, 27 ], [ 18, 28 ], [ 18, 29 ], [ 18, 30 ]
            ],
            dark_walls : [
                [ 1, 15 ], [ 2, 15 ], [ 3, 15 ], [ 4, 15 ], [ 27, 15 ], [ 28, 15 ], [ 29, 15 ], [ 30, 15 ]
            ],
            difficulty : "easy"
        },

        // Level 3 - Easy
        {
            line_string : "line_easy_02",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 3, light_y : 3,
            dark_x : 3, dark_y : 28,
            light_goal_x : 28, light_goal_y : 15,
            dark_goal_x : 29, dark_goal_y : 15,
            light_walls : [
                [ 18, 6 ], [ 19, 6 ], [ 20, 6 ], [ 21, 6 ], [ 22, 6 ], [ 23, 6 ], [ 24, 6 ], [ 25, 6 ], [ 26, 6 ],
                [ 27, 6 ], [ 28, 6 ], [ 29, 6 ], [ 30, 6 ], [ 18, 7 ], [ 18, 8 ], [ 18, 22 ], [ 18, 23 ], [ 18, 24 ],
                [ 19, 24 ], [ 20, 24 ], [ 21, 24 ], [ 22, 24 ], [ 23, 24 ], [ 24, 24 ], [ 25, 24 ], [ 26, 24 ],
                [ 27, 24 ], [ 28, 24 ], [ 29, 24 ], [ 30, 24 ]
            ],
            dark_walls : [
                [ 25, 13 ], [ 26, 13 ], [ 27, 13 ], [ 28, 13 ], [ 29, 13 ], [ 30, 13 ], [ 25, 17 ], [ 26, 17 ],
                [ 27, 17 ], [ 28, 17 ], [ 29, 17 ], [ 30, 17 ]
            ],
            difficulty : "easy"
        },

        // Level 4 - Easy
        {
            line_string : "line_easy_03",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 14, light_y : 4,
            dark_x : 16, dark_y : 27,
            light_goal_x : 14, light_goal_y : 27,
            dark_goal_x : 16, dark_goal_y : 4,
            light_walls : [
                [ 1, 30 ], [ 2, 29 ], [ 3, 28 ], [ 4, 27 ], [ 5, 26 ], [ 6, 25 ], [ 7, 24 ], [ 8, 23 ], [ 9, 22 ],
                [ 10, 21 ], [ 21, 10 ], [ 22, 9 ], [ 23, 8 ], [ 24, 7 ], [ 25, 6 ], [ 26, 5 ], [ 27, 4 ], [ 28, 3 ],
                [ 29, 2 ], [ 30, 1 ]
            ],
            dark_walls : [
                [ 1, 1 ], [ 2, 2 ], [ 3, 3 ], [ 4, 4 ], [ 5, 5 ], [ 6, 6 ], [ 7, 7 ], [ 8, 8 ], [ 9, 9 ], [ 10, 10 ],
                [ 21, 21 ], [ 22, 22 ], [ 23, 23 ], [ 24, 24 ], [ 25, 25 ], [ 26, 26 ], [ 27, 27 ], [ 28, 28 ],
                [ 29, 29 ], [ 30, 30 ]
            ],
            difficulty : "easy"
        },

        // Level 5 - Easy
        {
            line_string : "line_easy_04",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 27, light_y : 4,
            dark_x : 27, dark_y : 27,
            light_goal_x : 3, light_goal_y : 23,
            dark_goal_x : 15, dark_goal_y : 26,
            light_walls : [
                [ 1, 15 ], [ 2, 15 ], [ 3, 15 ], [ 4, 15 ], [ 27, 15 ], [ 28, 15 ], [ 29, 15 ], [ 30, 15 ], [ 6, 17 ],
                [ 6, 18 ], [ 6, 19 ], [ 6, 20 ], [ 6, 21 ], [ 6, 22 ], [ 6, 23 ], [ 6, 24 ], [ 6, 25 ], [ 6, 26 ],
                [ 6, 27 ], [ 6, 28 ], [ 6, 29 ], [ 6, 30 ]
            ],
            dark_walls : [
                [ 18, 1 ], [ 18, 2 ], [ 18, 3 ], [ 18, 4 ], [ 18, 5 ], [ 18, 6 ], [ 18, 7 ], [ 18, 8 ], [ 18, 22 ],
                [ 18, 23 ], [ 18, 24 ], [ 18, 25 ], [ 18, 26 ], [ 18, 27 ], [ 18, 28 ], [ 18, 29 ], [ 18, 30 ]
            ],
            difficulty : "easy"
        },

        // Level 6 - Easy
        {
            line_string : "line_easy_05",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 17, light_y : 29,
            dark_x : 14, dark_y : 29,
            light_goal_x : 15, light_goal_y : 23,
            dark_goal_x : 16, dark_goal_y : 7,
            light_walls : [
                [ 2, 14 ], [ 2, 15 ], [ 2, 16 ], [ 3, 13 ], [ 3, 17 ], [ 4, 12 ], [ 4, 18 ], [ 5, 11 ], [ 5, 19 ],
                [ 6, 10 ], [ 6, 20 ], [ 7, 9 ], [ 7, 21 ], [ 8, 8 ], [ 8, 22 ], [ 9, 7 ], [ 9, 23 ], [ 10, 6 ],
                [ 10, 24 ], [ 11, 5 ], [ 11, 25 ], [ 12, 5 ], [ 12, 25 ], [ 13, 5 ], [ 13, 25 ], [ 14, 5 ], [ 14, 25 ],
                [ 15, 5 ], [ 15, 25 ], [ 16, 5 ], [ 16, 25 ], [ 17, 5 ], [ 17, 25 ], [ 18, 5 ], [ 18, 25 ], [ 19, 5 ],
                [ 19, 25 ], [ 20, 5 ], [ 20, 25 ], [ 21, 6 ], [ 21, 24 ], [ 22, 7 ], [ 22, 23 ], [ 23, 8 ], [ 23, 22 ],
                [ 24, 9 ], [ 24, 21 ], [ 25, 10 ], [ 25, 20 ], [ 26, 11 ], [ 26, 19 ], [ 27, 12 ], [ 27, 18 ],
                [ 28, 13 ], [ 28, 17 ], [ 29, 14 ], [ 29, 15 ], [ 29, 16 ]
            ],
            dark_walls : [
                [ 1, 15 ], [ 2, 15 ], [ 3, 15 ], [ 4, 15 ], [ 13, 5 ], [ 13, 6 ], [ 13, 7 ], [ 13, 8 ], [ 14, 5 ],
                [ 15, 5 ], [ 16, 5 ], [ 17, 5 ], [ 18, 5 ], [ 18, 6 ], [ 18, 7 ], [ 18, 8 ],  [ 27, 15 ], [ 28, 15 ],
                [ 29, 15 ], [ 30, 15 ]
            ],
            difficulty : "easy"
        },

        // Level 7 - Medium
        {
            line_string : "line_medium_01",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 15, light_y : 8,
            dark_x : 9, dark_y : 9,
            light_goal_x : 16, light_goal_y : 22,
            dark_goal_x : 15, dark_goal_y : 25,
            light_walls : [
                [ 5, 23 ], [ 6, 23 ], [ 7, 23 ], [ 8, 23 ], [ 9, 23 ], [ 10, 23 ], [ 11, 23 ], [ 12, 23 ], [ 13, 23 ],
                [ 14, 23 ], [ 15, 23 ], [ 16, 23 ], [ 17, 23 ], [ 18, 23 ], [ 19, 23 ], [ 20, 23 ], [ 21, 23 ],
                [ 22, 23 ], [ 23, 23 ], [ 24, 23 ], [ 25, 23 ], [ 26, 23 ], [ 6, 22 ], [ 6, 21 ], [ 7, 20 ], [ 7, 19 ],
                [ 25, 22 ], [ 25, 21 ], [ 24, 20 ], [ 24, 19 ], [ 12, 9 ], [ 13, 8 ], [ 13, 7 ], [ 14, 6 ], [ 14, 5 ],
                [ 15, 4 ], [ 16, 4 ], [ 17, 5 ], [ 17, 6 ], [ 18, 7 ], [ 18, 8 ], [ 19, 9 ]
            ],
            dark_walls : [
                [ 5, 7 ], [ 6, 7 ], [ 7, 7 ], [ 8, 7 ], [ 9, 7 ], [ 10, 7 ], [ 11, 7 ], [ 12, 7 ], [ 13, 7 ], [ 14, 7 ],
                [ 15, 7 ], [ 16, 7 ], [ 17, 7 ], [ 18, 7 ], [ 19, 7 ], [ 20, 7 ], [ 21, 7 ], [ 22, 7 ], [ 23, 7 ],
                [ 24, 7 ], [ 25, 7 ], [ 26, 7 ],[ 6, 8 ], [ 6, 9 ], [ 7, 10 ], [ 7, 11 ], [ 24, 10 ], [ 24, 11 ],
                [ 25, 8 ], [ 25, 9 ], [ 12, 21 ], [ 13, 22 ], [ 13, 23 ], [ 14, 24 ], [ 14, 25 ], [ 15, 26 ],
                [ 16, 26 ], [ 17, 25 ], [ 17, 24 ], [ 18, 23 ], [ 18, 22 ], [ 19, 21 ]
            ],
            difficulty : "medium"
        },

        // Level 8 - Medium
        {
            line_string : "line_medium_02",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 16, light_y : 6,
            dark_x : 7, dark_y : 9,
            light_goal_x : 24, light_goal_y : 23,
            dark_goal_x : 15, dark_goal_y : 24,
            light_walls: [
                [ 6, 13 ], [ 5, 12 ], [ 4, 11 ], [ 3, 10 ], [ 3, 9 ], [ 3, 8 ], [ 3, 7 ], [ 3, 6 ], [ 4, 5 ], [ 5, 5 ],
                [ 6, 4 ], [ 7, 4 ], [ 8, 3 ], [ 9, 3 ], [ 10, 2 ], [ 10, 1 ], [ 11, 1 ], [ 12, 1 ], [ 12, 2 ],
                [ 13, 2 ], [ 14, 2 ], [ 15, 2 ], [ 16, 2 ], [ 17, 2 ], [ 18, 2 ], [ 19, 2 ], [ 19, 1 ], [ 20, 1 ],
                [ 21, 1 ], [ 21, 2 ], [ 22, 2 ], [ 23, 2 ], [ 24, 2 ], [ 25, 2 ], [ 26, 2 ], [ 27, 3 ], [ 27, 4 ],
                [ 27, 5 ], [ 26, 4 ], [ 25, 4 ], [ 24, 4 ], [ 23, 4 ], [ 22, 4 ], [ 21, 4 ], [ 21, 5 ], [ 21, 6 ],
                [ 21, 7 ], [ 21, 8 ], [ 21, 9 ], [ 21, 10 ], [ 12, 21 ], [ 12, 22 ], [ 12, 23 ], [ 12, 24 ], [ 12, 25 ],
                [ 12, 26 ], [ 12, 27 ], [ 13, 27 ], [ 14, 27 ], [ 15, 27 ], [ 16, 27 ], [ 17, 27 ], [ 18, 27 ],
                [ 19, 27 ], [ 19, 26 ], [ 19, 25 ], [ 19, 24 ], [ 19, 23 ], [ 19, 22 ], [ 19, 21 ], [ 21, 20 ],
                [ 21, 21 ], [ 21, 22 ], [ 21, 23 ], [ 21, 24 ], [ 21, 25 ], [ 21, 26 ], [ 22, 26 ], [ 23, 26 ],
                [ 24, 25 ], [ 25, 25 ], [ 26, 24 ], [ 26, 23 ], [ 26, 22 ], [ 26, 21 ], [ 25, 20 ], [ 24, 19 ]
            ],
            dark_walls : [
                [ 25, 18 ], [ 26, 19 ], [ 27, 20 ], [ 28, 21 ], [ 28, 22 ], [ 28, 23 ], [ 28, 24 ], [ 28, 25 ],
                [ 27, 26 ], [ 26, 26 ], [ 25, 27 ], [ 24, 27 ], [ 23, 28 ], [ 22, 28 ], [ 21, 28 ], [ 21, 29 ],
                [ 21, 30 ], [ 20, 30 ], [ 19, 30 ], [ 19, 29 ], [ 18, 29 ], [ 17, 29 ], [ 16, 29 ], [ 15, 29 ],
                [ 14, 29 ], [ 13, 29 ], [ 12, 29 ], [ 12, 30 ], [ 11, 30 ], [ 10, 30 ], [ 10, 29 ], [ 9, 29 ],
                [ 8, 29 ], [ 7, 29 ], [ 6, 29 ], [ 5, 29 ], [ 4, 28 ], [ 4, 27 ], [ 4, 26 ], [ 5, 27 ], [ 6, 27 ],
                [ 7, 27 ], [ 8, 27 ], [ 9, 27 ], [ 10, 27 ], [ 10, 26 ], [ 10, 25 ], [ 10, 24 ], [ 10, 23 ], [ 10, 22 ],
                [ 10, 21 ], [ 10, 20 ], [ 7, 12 ], [ 6, 11 ], [ 5, 10 ], [ 5, 9 ], [ 5, 8 ], [ 5, 7 ], [ 6, 6 ],
                [ 7, 6 ], [ 8, 5 ], [ 9, 5 ], [ 10, 5 ], [ 10, 6 ], [ 10, 7 ], [ 10, 8 ], [ 10, 9 ], [ 10, 10 ],
                [ 12, 9 ], [ 12, 8 ], [ 12, 7 ], [ 12, 6 ], [ 12, 5 ], [ 12, 4 ], [ 13, 4 ], [ 14, 4 ], [ 15, 4 ],
                [ 16, 4 ], [ 17, 4 ], [ 18, 4 ], [ 19, 4 ], [ 19, 5 ], [ 19, 6 ], [ 19, 7 ], [ 19, 8 ], [ 19, 9 ]
            ],
            difficulty : "medium"
        },

        // Level 9 - Medium
        {
            line_string : "line_medium_03",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 21, light_y : 10,
            dark_x : 13, dark_y : 25,
            light_goal_x : 18, light_goal_y : 25,
            dark_goal_x : 10, dark_goal_y : 10,
            light_walls : [
                [ 16, 8 ], [ 16, 7 ], [ 16, 6 ], [ 17, 6 ], [ 18, 6 ], [ 19, 6 ], [ 20, 6 ], [ 21, 6 ], [ 22, 6 ],
                [ 23, 6 ], [ 24, 6 ], [ 25, 6 ], [ 26, 6 ], [ 27, 6 ], [ 28, 5 ], [ 29, 4 ], [ 30, 3 ], [ 30, 7 ],
                [ 29, 7 ], [ 28, 8 ], [ 27, 8 ], [ 26, 8 ], [ 26, 9 ], [ 26, 10 ], [ 26, 11 ], [ 26, 12 ], [ 27, 13 ],
                [ 27, 14 ], [ 24, 9 ], [ 24, 10 ], [ 24, 11 ], [ 24, 12 ], [ 23, 8 ], [ 22, 8 ], [ 21, 8 ], [ 20, 8 ],
                [ 19, 9 ], [ 24, 18 ], [ 24, 19 ], [ 24, 20 ], [ 24, 21 ], [ 24, 22 ], [ 24, 23 ], [ 24, 24 ], [ 24, 25 ],
                [ 24, 26 ], [ 24, 27 ], [ 24, 28 ], [ 24, 29 ], [ 23, 30 ],[ 26, 16 ], [ 26, 17 ], [ 26, 18 ], [ 26, 19 ],
                [ 26, 20 ], [ 26, 21 ], [ 26, 22 ], [ 26, 23 ], [ 26, 24 ], [ 26, 25 ], [ 26, 26 ], [ 26, 27 ],
                [ 26, 28 ], [ 26, 29 ], [ 27, 30 ]
            ],
            dark_walls : [
                [ 1, 3 ], [ 2, 4 ], [ 3, 5 ], [ 4, 6 ], [ 5, 6 ], [ 6, 6 ], [ 7, 6 ], [ 8, 6 ], [ 9, 6 ], [ 10, 6 ],
                [ 11, 6 ], [ 12, 6 ], [ 13, 6 ], [ 14, 6 ], [ 15, 6 ], [ 15, 7 ], [ 15, 8 ], [ 1, 7 ], [ 2, 7 ], [ 3, 8 ],
                [ 4, 8 ], [ 5, 8 ], [ 5, 9 ], [ 5, 10 ], [ 5, 11 ], [ 5, 12 ], [ 4, 13 ], [ 4, 14 ], [ 7, 8 ], [ 7, 9 ],
                [ 7, 10 ], [ 7, 11 ], [ 7, 12 ], [ 8, 8 ], [ 9, 8 ], [ 10, 8 ], [ 11, 8 ], [ 12, 9 ], [ 5, 16 ],
                [ 5, 17 ], [ 5, 18 ], [ 5, 19 ], [ 5, 20 ], [ 5, 21 ], [ 5, 22 ], [ 5, 23 ], [ 5, 24 ], [ 5, 25 ],
                [ 5, 26 ], [ 5, 27 ], [ 5, 28 ], [ 5, 29 ], [ 4, 30 ], [ 7, 18 ], [ 7, 19 ], [ 7, 20 ], [ 7, 21 ],
                [ 7, 22 ], [ 7, 23 ], [ 7, 24 ], [ 7, 25 ], [ 7, 26 ], [ 7, 27 ], [ 7, 28 ], [ 7, 29 ], [ 8, 30 ]
            ],
            difficulty : "medium"
        },

        // Level 10 - Medium
        {
            line_string : "line_medium_04",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x: 26, light_y: 10,
            dark_x: 16, dark_y: 26,
            light_goal_x: 28, light_goal_y: 10,
            dark_goal_x: 16, dark_goal_y: 2,
            light_walls : [
                [ 1, 6 ], [ 2, 6 ], [ 3, 6 ], [ 4, 6 ], [ 5, 6 ], [ 6, 6 ], [ 7, 6 ], [ 8, 6 ], [ 9, 6 ], [ 10, 6 ],
                [ 11, 6 ], [ 12, 6 ], [ 13, 6 ], [ 14, 6 ], [ 14, 7 ], [ 14, 8 ], [ 12, 7 ], [ 11, 8 ], [ 10, 9 ],
                [ 9, 10 ], [ 8, 11 ], [ 7, 12 ], [ 6, 13 ], [ 5, 14 ], [ 4, 15 ], [ 3, 16 ], [ 2, 17 ], [ 1, 18 ],
                [ 17, 22 ], [ 17, 23 ], [ 17, 24 ], [ 17, 25 ], [ 17, 27 ], [ 17, 28 ], [ 17, 29 ], [ 17, 30 ],
                [ 18, 25 ], [ 19, 25 ], [ 20, 25 ], [ 21, 25 ], [ 22, 25 ], [ 23, 25 ], [ 24, 25 ], [ 25, 25 ],
                [ 25, 26 ], [ 25, 27 ], [ 24, 27 ], [ 23, 27 ], [ 22, 27 ], [ 21, 27 ], [ 20, 27 ], [ 19, 27 ],
                [ 18, 27 ]
            ],
            dark_walls : [
                [ 1, 4 ], [ 2, 4 ], [ 3, 4 ], [ 4, 4 ], [ 5, 4 ], [ 6, 4 ], [ 7, 4 ], [ 8, 4 ], [ 9, 4 ], [ 10, 4 ],
                [ 11, 4 ], [ 12, 4 ], [ 13, 4 ], [ 14, 4 ], [ 15, 4 ], [ 16, 4 ], [ 17, 4 ], [ 18, 4 ], [ 19, 4 ],
                [ 20, 4 ], [ 21, 4 ], [ 22, 4 ], [ 23, 4 ], [ 24, 4 ], [ 25, 4 ], [ 26, 4 ], [ 27, 4 ], [ 28, 4 ],
                [ 29, 4 ], [ 30, 4 ], [ 17, 8 ], [ 17, 7 ], [ 17, 6 ], [ 18, 6 ], [ 19, 6 ], [ 20, 6 ], [ 21, 6 ],
                [ 22, 6 ], [ 23, 6 ], [ 24, 6 ], [ 25, 6 ], [ 26, 6 ], [ 27, 6 ], [ 28, 6 ], [ 29, 6 ], [ 30, 6 ],
                [ 19, 7 ], [ 20, 8 ], [ 21, 9 ], [ 22, 10 ], [ 23, 11 ], [ 24, 12 ], [ 25, 13 ], [ 26, 14 ], [ 27, 15 ],
                [ 28, 16 ], [ 29, 17 ], [ 30, 18 ], [ 14, 22 ], [ 14, 23 ], [ 14, 24 ], [ 14, 25 ], [ 14, 27 ],
                [ 14, 28 ], [ 14, 29 ], [ 14, 30 ], [ 13, 25 ], [ 12, 25 ], [ 11, 25 ], [ 10, 25 ], [ 9, 25 ],
                [ 8, 25 ], [ 7, 25 ], [ 6, 25 ], [ 6, 26 ], [ 6, 27 ], [ 7, 27 ], [ 8, 27 ], [ 9, 27 ], [ 10, 27 ],
                [ 11, 27 ], [ 12, 27 ], [ 13, 27 ]
            ],
            difficulty : "medium"
        },

        // Level 11 - Medium
        {
            line_string : "line_medium_05",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 14, light_y : 26,
            dark_x : 23, dark_y : 9,
            light_goal_x : 9, light_goal_y : 4,
            dark_goal_x : 19, dark_goal_y : 30,
            light_walls : [
                [ 3, 5 ], [ 4, 4 ], [ 4, 6 ], [ 5, 3 ], [ 5, 6 ], [ 5, 10 ], [ 5, 11 ], [ 5, 12 ], [ 5, 13 ], [ 5, 14 ],
                [ 6, 3 ], [ 6, 6 ], [ 6, 9 ], [ 7, 3 ], [ 7, 6 ], [ 7, 8 ], [ 8, 2 ], [ 8, 7 ], [ 9, 2 ], [ 9, 9 ],
                [ 10, 2 ], [ 10, 8 ], [ 10, 10 ], [ 11, 3 ], [ 11, 4 ], [ 11, 7 ], [ 12, 5 ], [ 12, 6 ], [ 15, 22 ],
                [ 14, 23 ], [ 13, 24 ], [ 12, 25 ], [ 11, 26 ], [ 10, 27 ], [ 9, 28 ], [ 10, 28 ], [ 11, 28 ], [ 12, 28 ],
                [ 13, 28 ], [ 14, 28 ], [ 15, 28 ], [ 16, 28 ], [ 17, 28 ], [ 18, 28 ], [ 19, 28 ], [ 20, 28 ],
                [ 21, 28 ], [ 21, 29 ], [ 21, 30 ]
            ],
            dark_walls : [
                [ 15, 8 ], [ 16, 8 ], [ 17, 7 ], [ 18, 7 ], [ 19, 6 ], [ 20, 6 ], [ 21, 6 ], [ 22, 7 ], [ 23, 7 ],
                [ 24, 7 ], [ 25, 8 ], [ 26, 9 ], [ 27, 10 ], [ 27, 11 ], [ 28, 12 ], [ 28, 13 ], [ 28, 14 ], [ 28, 15 ],
                [ 28, 16 ], [ 28, 17 ], [ 28, 18 ], [ 27, 17 ], [ 26, 16 ], [ 16, 22 ], [ 16, 23 ], [ 16, 24 ],
                [ 16, 25 ], [ 16, 26 ], [ 16, 27 ], [ 16, 28 ], [ 16, 29 ], [ 16, 30 ]
            ],
            difficulty : "medium"
        },

        // Level 12 - Hard
        {
            line_string : "line_hard_01",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 12, light_y : 6,
            dark_x : 3, dark_y : 3,
            light_goal_x : 28, light_goal_y : 28,
            dark_goal_x : 19, dark_goal_y : 25,
            light_walls : [
                [ 14, 1 ], [ 15, 1 ], [ 16, 1 ], [ 17, 1 ], [ 18, 2 ], [ 19, 2 ], [ 20, 2 ], [ 21, 3 ], [ 22, 3 ],
                [ 23, 4 ], [ 24, 5 ], [ 25, 6 ], [ 26, 7 ], [ 27, 8 ], [ 28, 9 ], [ 29, 10 ], [ 29, 11 ], [ 29, 12 ],
                [ 30, 13 ], [ 30, 14 ], [ 30, 15 ], [ 30, 16 ], [ 30, 17 ], [ 30, 18 ], [ 29, 19 ], [ 29, 20 ],
                [ 29, 21 ], [ 28, 22 ], [ 27, 23 ], [ 26, 24 ], [ 25, 25 ], [ 24, 26 ], [ 23, 27 ], [ 22, 28 ],
                [ 21, 28 ], [ 20, 29 ], [ 19, 29 ], [ 18, 29 ], [ 17, 28 ], [ 16, 28 ], [ 15, 28 ], [ 14, 27 ],
                [ 13, 27 ], [ 12, 26 ], [ 11, 25 ], [ 10, 24 ], [ 10, 23 ], [ 9, 22 ], [ 9, 21 ], [ 10, 20 ], [ 10, 6 ],
                [ 11, 5 ], [ 11, 7 ], [ 12, 5 ], [ 12, 7 ], [ 13, 5 ], [ 13, 7 ], [ 14, 6 ]
            ],
            dark_walls : [
                [ 17, 30 ], [ 16, 30 ], [ 15, 30 ], [ 14, 30 ], [ 13, 29 ], [ 12, 29 ], [ 11, 29 ], [ 10, 28 ],
                [ 9, 28 ], [ 8, 27 ], [ 7, 26 ], [ 6, 25 ], [ 5, 24 ], [ 4, 23 ], [ 3, 22 ], [ 2, 21 ], [ 2, 20 ],
                [ 2, 19 ], [ 1, 18 ], [ 1, 17 ], [ 1, 16 ], [ 1, 15 ], [ 1, 14 ], [ 1, 13 ], [ 2, 12 ], [ 2, 11 ],
                [ 2, 10 ], [ 3, 9 ], [ 4, 8 ], [ 5, 7 ], [ 6, 6 ], [ 7, 5 ], [ 8, 4 ], [ 9, 3 ], [ 10, 3 ], [ 11, 2 ],
                [ 12, 2 ], [ 13, 2 ], [ 14, 3 ], [ 15, 3 ], [ 16, 3 ], [ 17, 4 ], [ 18, 4 ], [ 19, 5 ], [ 20, 6 ],
                [ 21, 7 ], [ 21, 8 ], [ 22, 9 ], [ 22, 10 ], [ 21, 25 ], [ 20, 24 ], [ 20, 26 ], [ 19, 24 ], [ 19, 26 ],
                [ 18, 24 ], [ 18, 26 ], [ 17, 25 ]
            ],
            difficulty : "hard"
        },

        // Level 13 - Hard
        {
            line_string : "line_hard_02",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 3, light_y : 2,
            dark_x : 23, dark_y : 3,
            light_goal_x : 15, light_goal_y : 7,
            dark_goal_x : 15, dark_goal_y : 23,
            light_walls : [
                [ 18, 8 ], [ 18, 7 ], [ 17, 6 ], [ 16, 5 ], [ 15, 4 ], [ 14, 4 ], [ 14, 5 ], [ 14, 6 ], [ 13, 7 ],
                [ 12, 7 ], [ 11, 8 ], [ 10, 8 ], [ 9, 9 ], [ 8, 9 ], [ 7, 9 ], [ 6, 9 ], [ 5, 8 ], [ 4, 9 ], [ 4, 10 ],
                [ 4, 11 ], [ 4, 12 ], [ 3, 13 ], [ 3, 14 ], [ 3, 15 ], [ 3, 16 ], [ 3, 17 ], [ 3, 18 ], [ 3, 19 ],
                [ 4, 20 ], [ 5, 21 ], [ 6, 22 ], [ 7, 23 ], [ 7, 24 ], [ 7, 25 ], [ 8, 25 ], [ 9, 26 ], [ 10, 26 ],
                [ 11, 26 ], [ 12, 27 ], [ 13, 27 ], [ 14, 27 ], [ 15, 27 ], [ 16, 27 ], [ 17, 27 ], [ 18, 27 ],
                [ 19, 26 ], [ 20, 26 ], [ 21, 26 ], [ 22, 26 ], [ 23, 25 ], [ 24, 25 ], [ 25, 24 ], [ 26, 23 ],
                [ 25, 22 ], [ 25, 21 ], [ 26, 20 ], [ 26, 19 ], [ 25, 18 ], [ 24, 19 ], [ 23, 19 ]
            ],
            dark_walls : [
                [ 21, 10 ], [ 21, 9 ], [ 21, 8 ], [ 20, 7 ], [ 20, 6 ], [ 19, 5 ], [ 18, 4 ], [ 17, 3 ], [ 16, 2 ],
                [ 15, 1 ], [ 14, 1 ], [ 13, 1 ], [ 12, 1 ], [ 11, 1 ], [ 10, 1 ], [ 9, 2 ], [ 8, 2 ], [ 10, 3 ],
                [ 11, 4 ], [ 10, 5 ], [ 9, 6 ], [ 8, 7 ], [ 7, 7 ], [ 6, 6 ], [ 5, 5 ], [ 4, 6 ], [ 3, 7 ], [ 2, 8 ],
                [ 2, 9 ], [ 2, 10 ], [ 2, 11 ], [ 1, 12 ], [ 1, 13 ], [ 1, 14 ], [ 1, 15 ], [ 1, 16 ], [ 1, 17 ],
                [ 1, 18 ], [ 1, 19 ], [ 1, 20 ], [ 1, 21 ], [ 2, 22 ], [ 3, 23 ], [ 4, 24 ], [ 4, 25 ], [ 5, 26 ],
                [ 5, 27 ], [ 6, 28 ], [ 7, 28 ], [ 8, 28 ], [ 9, 29 ], [ 10, 29 ], [ 11, 29 ], [ 12, 29 ], [ 13, 30 ],
                [ 14, 30 ], [ 15, 30 ], [ 16, 30 ], [ 17, 30 ], [ 18, 30 ], [ 19, 29 ], [ 20, 29 ], [ 21, 29 ],
                [ 22, 29 ], [ 23, 28 ], [ 24, 28 ], [ 25, 28 ], [ 26, 27 ], [ 26, 26 ], [ 27, 25 ], [ 28, 24 ],
                [ 28, 23 ], [ 28, 22 ], [ 29, 21 ], [ 29, 20 ], [ 29, 19 ], [ 29, 18 ], [ 29, 17 ], [ 29, 16 ],
                [ 29, 15 ], [ 28, 14 ], [ 28, 13 ], [ 28, 12 ], [ 27, 11 ], [ 26, 10 ], [ 25, 11 ], [ 24, 12 ],
                [ 12, 21 ], [ 11, 22 ], [ 11, 23 ], [ 12, 24 ], [ 13, 25 ], [ 14, 25 ], [ 15, 25 ], [ 16, 25 ],
                [ 17, 25 ], [ 18, 24 ], [ 19, 23 ], [ 20, 22 ], [ 19, 21 ], [ 22, 1 ], [ 23, 1 ], [ 25, 1 ], [ 21, 2 ],
                [ 24, 2 ], [ 25, 2 ], [ 21, 3 ], [ 26, 3 ], [ 22, 4 ], [ 26, 4 ], [ 22, 5 ], [ 24, 5 ], [ 25, 5 ],
                [ 23, 6 ]
            ],
            difficulty : "hard"
        },

        // Level 14 - Hard
        {
            line_string : "line_hard_03",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 15, light_y : 3,
            dark_x : 8, dark_y : 10,
            light_goal_x : 23, light_goal_y : 24,
            dark_goal_x : 2, dark_goal_y : 29,
            light_walls : [
                [ 1, 26 ], [ 2, 26 ], [ 29, 26 ], [ 30, 26 ], [ 8, 1 ], [ 8, 2 ], [ 8, 3 ], [ 8, 4 ], [ 7, 2 ],
                [ 9, 2 ], [ 9, 5 ], [ 9, 6 ], [ 23, 1 ], [ 23, 2 ], [ 23, 3 ], [ 23, 4 ], [ 22, 2 ], [ 24, 2 ],
                [ 22, 5 ], [ 22, 6 ], [ 2, 25 ], [ 2, 24 ], [ 2, 23 ], [ 2, 22 ], [ 2, 21 ], [ 3, 20 ], [ 4, 19 ],
                [ 4, 18 ], [ 4, 17 ], [ 5, 16 ], [ 9, 7 ], [ 9, 8 ], [ 10, 9 ], [ 10, 10 ], [ 17, 8 ], [ 18, 7 ],
                [ 19, 7 ], [ 20, 7 ], [ 20, 6 ], [ 21, 6 ], [ 23, 5 ], [ 24, 5 ], [ 24, 6 ], [ 24, 7 ], [ 24, 8 ],
                [ 25, 9 ], [ 25, 10 ], [ 25, 11 ], [ 25, 12 ], [ 26, 13 ], [ 26, 14 ], [ 17, 22 ], [ 17, 23 ],
                [ 17, 24 ], [ 17, 25 ], [ 17, 26 ], [ 18, 26 ], [ 19, 26 ], [ 20, 26 ], [ 21, 26 ], [ 22, 26 ],
                [ 23, 26 ], [ 24, 26 ], [ 25, 26 ], [ 26, 26 ], [ 27, 26 ], [ 28, 26 ], [ 21, 25 ], [ 21, 24 ],
                [ 21, 23 ], [ 22, 22 ], [ 23, 22 ], [ 24, 22 ], [ 25, 23 ], [ 25, 24 ], [ 25, 25 ]
            ],
            dark_walls : [
                [ 1, 26 ], [ 2, 26 ], [ 29, 26 ], [ 30, 26 ], [ 8, 1 ], [ 8, 2 ], [ 8, 3 ], [ 8, 4 ], [ 7, 2 ],
                [ 9, 2 ], [ 9, 5 ], [ 9, 6 ], [ 23, 1 ], [ 23, 2 ], [ 23, 3 ], [ 23, 4 ], [ 22, 2 ], [ 24, 2 ],
                [ 22, 5 ], [ 22, 6 ], [ 3, 26 ], [ 4, 26 ], [ 5, 26 ], [ 6, 26 ], [ 7, 26 ], [ 8, 26 ], [ 9, 26 ],
                [ 10, 26 ], [ 11, 26 ], [ 12, 26 ], [ 13, 26 ], [ 14, 26 ], [ 14, 25 ],  [ 14, 24 ], [ 14, 23 ],
                [ 14, 22 ], [ 6, 25 ], [ 6, 24 ], [ 6, 23 ], [ 7, 22 ], [ 8, 22 ], [ 9, 22 ], [ 10, 23 ], [ 10, 24 ],
                [ 10, 25 ], [ 5, 14 ], [ 5, 13 ], [ 6, 12 ], [ 6, 11 ], [ 6, 10 ], [ 6, 9 ], [ 7, 8 ], [ 7, 7 ],
                [ 7, 6 ], [ 7, 5 ], [ 8, 5 ], [ 10, 6 ], [ 11, 6 ], [ 11, 7 ], [ 12, 7 ], [ 13, 7 ], [ 14, 8 ],
                [ 21, 10 ], [ 21, 9 ], [ 22, 8 ], [ 22, 7 ], [ 26, 16 ], [ 27, 17 ], [ 27, 18 ], [ 27, 19 ], [ 28, 20 ],
                [ 29, 21 ], [ 29, 22 ], [ 29, 23 ], [ 29, 24 ], [ 29, 25 ]
            ],
            difficulty : "hard"
        },

        // Level 15 - Hard
        {
            line_string : "line_hard_04",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 15, light_y : 23,
            dark_x : 15, dark_y : 23,
            light_goal_x : 9, light_goal_y : 8,
            dark_goal_x : 16, dark_goal_y : 7,
            light_walls : [
                [ 7, 6 ], [ 7, 7 ], [ 7, 8 ], [ 7, 9 ], [ 7, 10 ], [ 7, 11 ], [ 7, 12 ], [ 8, 5 ], [ 9, 4 ], [ 10, 4 ],
                [ 11, 5 ], [ 12, 6 ], [ 13, 6 ], [ 14, 6 ], [ 15, 6 ], [ 16, 6 ], [ 17, 6 ], [ 18, 6 ], [ 19, 6 ],
                [ 20, 5 ], [ 21, 4 ], [ 22, 4 ], [ 23, 5 ], [ 24, 6 ], [ 24, 7 ], [ 24, 8 ], [ 24, 9 ], [ 24, 10 ],
                [ 24, 11 ], [ 24, 12 ], [ 7, 18 ], [ 7, 19 ], [ 7, 20 ], [ 8, 21 ], [ 8, 22 ], [ 8, 23 ], [ 9, 24 ],
                [ 10, 25 ], [ 10, 26 ], [ 11, 27 ], [ 12, 28 ], [ 13, 28 ], [ 14, 29 ], [ 15, 29 ], [ 16, 29 ],
                [ 17, 29 ], [ 18, 28 ], [ 19, 28 ], [ 20, 27 ], [ 21, 26 ], [ 21, 25 ], [ 22, 24 ], [ 23, 23 ],
                [ 23, 22 ], [ 23, 21 ], [ 24, 20 ], [ 24, 19 ], [ 24, 18 ]
            ],
            dark_walls : [
                [ 13, 8 ], [ 13, 7 ], [ 13, 6 ], [ 13, 5 ], [ 13, 4 ], [ 13, 3 ], [ 14, 2 ], [ 15, 1 ], [ 16, 1 ],
                [ 17, 2 ], [ 18, 3 ], [ 18, 4 ], [ 18, 5 ], [ 18, 6 ], [ 18, 7 ], [ 18, 8 ], [ 4, 15 ], [ 3, 15 ],
                [ 2, 14 ], [ 1, 14 ], [ 1, 15 ], [ 2, 16 ], [ 3, 17 ], [ 4, 18 ], [ 4, 19 ], [ 5, 20 ], [ 5, 21 ],
                [ 6, 22 ], [ 7, 23 ], [ 8, 23 ], [ 9, 24 ], [ 10, 25 ], [ 11, 25 ], [ 12, 25 ], [ 13, 26 ], [ 14, 26 ],
                [ 15, 26 ], [ 16, 26 ], [ 17, 26 ], [ 18, 26 ], [ 19, 25 ], [ 20, 25 ], [ 21, 25 ], [ 22, 24 ],
                [ 23, 23 ], [ 24, 23 ], [ 25, 22 ], [ 26, 21 ], [ 26, 20 ], [ 27, 19 ], [ 27, 18 ], [ 28, 17 ],
                [ 29, 16 ], [ 30, 15 ], [ 30, 14 ], [ 29, 14 ], [ 28, 15 ], [ 27, 15 ]
            ],
            difficulty : "hard"
        },

        // Level 16 - Hard
        {
            line_string : "line_hard_05",
            line_obj : { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME },
            light_x : 26, light_y : 16,
            dark_x : 26, dark_y : 8,
            light_goal_x : 22, light_goal_y : 4,
            dark_goal_x : 7, dark_goal_y : 10,
            light_walls : [
                [ 3, 30 ], [ 4, 29 ], [ 4, 28 ], [ 5, 27 ], [ 6, 27 ], [ 7, 27 ], [ 8, 27 ], [ 9, 27 ], [ 10, 27 ],
                [ 11, 27 ], [ 12, 27 ], [ 13, 27 ], [ 14, 27 ], [ 15, 27 ], [ 16, 27 ], [ 17, 27 ], [ 18, 27 ],
                [ 19, 27 ], [ 20, 27 ], [ 21, 27 ], [ 22, 26 ], [ 21, 25 ], [ 20, 25 ], [ 19, 25 ], [ 18, 25 ],
                [ 17, 25 ], [ 16, 25 ], [ 15, 25 ], [ 14, 25 ], [ 13, 25 ], [ 12, 25 ], [ 11, 25 ], [ 10, 24 ],
                [ 9, 24 ], [ 8, 24 ], [ 7, 23 ], [ 6, 22 ], [ 5, 21 ], [ 4, 20 ], [ 4, 19 ], [ 4, 18 ], [ 3, 17 ],
                [ 2, 16 ], [ 1, 15 ], [ 1, 14 ], [ 1, 13 ], [ 2, 12 ], [ 3, 11 ], [ 4, 10 ], [ 4, 9 ], [ 4, 8 ],
                [ 4, 7 ], [ 4, 6 ], [ 5, 5 ], [ 6, 4 ], [ 7, 4 ], [ 8, 4 ], [ 9, 5 ], [ 10, 6 ], [ 10, 7 ], [ 11, 8 ],
                [ 12, 9 ], [ 16, 8 ], [ 16, 7 ], [ 16, 6 ], [ 17, 5 ], [ 18, 4 ], [ 19, 3 ], [ 20, 2 ], [ 21, 2 ],
                [ 22, 2 ], [ 23, 2 ], [ 24, 3 ], [ 25, 3 ], [ 25, 4 ], [ 25, 5 ], [ 26, 5 ], [ 27, 6 ], [ 28, 7 ],
                [ 29, 8 ], [ 29, 9 ], [ 29, 10 ], [ 30, 8 ], [ 21, 10 ], [ 22, 10 ], [ 23, 10 ], [ 24, 11 ], [ 25, 11 ],
                [ 26, 11 ], [ 27, 12 ], [ 27, 13 ], [ 28, 14 ], [ 28, 15 ], [ 29, 16 ], [ 29, 17 ], [ 28, 18 ],
                [ 27, 18 ], [ 26, 19 ], [ 25, 19 ], [ 24, 20 ], [ 23, 20 ], [ 22, 20 ], [ 21, 20 ]
            ],
            dark_walls : [
                [ 25, 5 ], [ 26, 5 ], [ 27, 6 ], [ 28, 7 ], [ 29, 8 ], [ 29, 9 ], [ 29, 10 ], [ 30, 8 ], [ 24, 6 ],
                [ 23, 6 ], [ 22, 6 ], [ 21, 6 ], [ 20, 5 ], [ 19, 6 ], [ 18, 7 ], [ 18, 8 ], [ 10, 10 ], [ 9, 9 ],
                [ 8, 8 ], [ 8, 7 ], [ 7, 6 ], [ 6, 7 ], [ 6, 8 ], [ 6, 9 ], [ 6, 10 ], [ 6, 11 ], [ 5, 12 ], [ 4, 13 ],
                [ 3, 14 ], [ 4, 15 ], [ 6, 17 ], [ 6, 18 ], [ 6, 19 ], [ 7, 20 ], [ 8, 21 ], [ 9, 22 ], [ 10, 22 ],
                [ 11, 22 ], [ 12, 23 ], [ 13, 23 ], [ 14, 23 ], [ 15, 23 ], [ 16, 23 ], [ 17, 23 ], [ 18, 23 ],
                [ 19, 23 ], [ 20, 23 ], [ 21, 23 ], [ 22, 23 ], [ 23, 24 ], [ 24, 25 ], [ 25, 26 ], [ 25, 27 ],
                [ 24, 28 ], [ 23, 29 ], [ 22, 29 ], [ 21, 29 ], [ 20, 29 ], [ 19, 29 ], [ 18, 29 ], [ 17, 29 ],
                [ 16, 29 ], [ 15, 29 ], [ 14, 29 ], [ 13, 29 ], [ 12, 29 ], [ 11, 29 ], [ 10, 29 ], [ 9, 29 ],
                [ 8, 29 ], [ 7, 29 ], [ 6, 30 ]
            ],
            difficulty : "hard"
        }
    ];

    // 32 x 32 array of basic layout (walls on border and eye outline in middle)
    // 0 = layer background color (COLOR_LIGHT for PLANE_LIGHT, COLOR_DARK for PLANE_DARK)
    // 1 = COLOR_IMPASSABLE (walls on border and eye outline in the middle)

    var base_map = [
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    ];

    // Resets both layers to base_map with no player beads, goals, or walls
    function resetMap () {
        var x, y, num;

        PS.border( PS.ALL, PS.ALL, 0 ); // No borders on beads

        // Change active plane to PLANE_LIGHT
        PS.gridPlane( PLANE_LIGHT );

        for ( y = 0; y < GRID_HEIGHT; y += 1 ) {
            for ( x = 0; x < GRID_WIDTH; x += 1 ) {
                num = base_map [ ( y * GRID_WIDTH ) + x ];
                if ( num === 0 ) {
                    PS.color( x, y, COLOR_LIGHT );
                } else if ( num === 1 ) {
                    PS.color( x, y, COLOR_IMPASSABLE );
                }
            }
        }

        // Change active plane to PLANE_DARK
        PS.gridPlane( PLANE_DARK );

        for ( y = 0; y < GRID_HEIGHT; y += 1 ) {
            for ( x = 0; x < GRID_WIDTH; x += 1 ) {
                num = base_map [ ( y * GRID_WIDTH ) + x ];
                if ( num === 0 ) {
                    PS.color( x, y, COLOR_DARK );
                } else if ( num === 1 ) {
                    PS.color( x, y, COLOR_IMPASSABLE );
                }
            }
        }

        // Reset wall data for all beads
        for ( y = 0; y < GRID_HEIGHT; y += 1 ) {
            for (x = 0; x < GRID_WIDTH; x += 1) {
                PS.data( x, y, NOT_WALL );
            }
        }
    }

    // Place light and dark player beads
    function placePlayers ( lx, ly, dx, dy ) {

        // Change active plane to PLANE_DARK
        PS.gridPlane( PLANE_DARK );

        // Place light player bead on PLANE_DARK
        light_x = lx;
        light_y = ly;
        PS.color( lx, ly, COLOR_LIGHT );

        // Change active plane to PLANE_LIGHT
        PS.gridPlane( PLANE_LIGHT );

        // Place dark player bead on PLANE_LIGHT
        dark_x = dx;
        dark_y = dy;
        PS.color( dx, dy, COLOR_DARK );
    }

    // Set up light and dark goals
    function setGoals ( lgx, lgy, dgx, dgy ) {

        // Change active plane to PLANE_DARK
        PS.gridPlane( PLANE_DARK );

        // Place light goal on PLANE_DARK
        light_goal_x = lgx;
        light_goal_y = lgy;
        PS.color( lgx, lgy, COLOR_DARK );
        PS.border( lgx, lgy, GOAL_WIDTH_BORDER );
        PS.borderColor( lgx, lgy, COLOR_LIGHT );
        PS.border( lgx, lgy, 0 );

        // Change active plane to PLANE_LIGHT
        PS.gridPlane( PLANE_LIGHT );

        // Place dark goal on PLANE_LIGHT
        dark_goal_x = dgx;
        dark_goal_y = dgy;
        PS.color( dgx, dgy, COLOR_LIGHT );
        PS.border( dgx, dgy, GOAL_WIDTH_BORDER );
        PS.borderColor( dgx, dgy, COLOR_DARK );
        PS.border( dgx, dgy, 0 );
    }

    // Plays dialogue line for specified level and stops dialogueTimer
    function playDialogue() {

        // Initialize level from data
        data = levelData[ level ];

        // Play dialogue
        PS.audioPlay( data.line_string, data.line_obj );

        // Stop timer
        PS.timerStop( dialogueTimer );
    }

    // Starts specified level
    function startLevel ( val ) {
        var data, len, li, di, pos, lx, ly, dx, dy, plane;

        play = false; // Player cannot move during setup

        level = val;

        plane = PS.gridPlane(); // Get active plane

        // Reset layers
        resetMap();

        // Initialize level from data
        data = levelData[ level ];

        // Set up player beads
        placePlayers( data.light_x, data.light_y, data.dark_x, data.dark_y );

        // Set up goals
        setGoals( data.light_goal_x, data.light_goal_y, data.dark_goal_x, data.dark_goal_y );

        // Set up light walls, if any
        if ( data.light_walls !== undefined ) {

            // Change active plane to PLANE_DARK
            PS.gridPlane( PLANE_DARK );

            len = data.light_walls.length;
            for ( li = 0; li < len; li += 1 ) {
                pos = data.light_walls[ li ];
                lx = pos[ 0 ];
                ly = pos[ 1 ];
                PS.color( lx, ly, COLOR_LIGHT );
                PS.data( lx, ly, IS_WALL_LIGHT );
            }
        }

        // Set up dark walls, if any
        if ( data.dark_walls !== undefined ) {

            // Change active plane to PLANE_LIGHT
            PS.gridPlane( PLANE_LIGHT );

            len = data.dark_walls.length;
            for ( di = 0; di < len; di += 1 ) {
                pos = data.dark_walls[ di ];
                dx = pos[ 0 ];
                dy = pos[ 1 ];
                PS.color( dx, dy, COLOR_DARK );
                PS.data( dx, dy, IS_WALL_DARK );
            }
        }

        // Set active plane back to what it was
        PS.gridPlane( plane );

        // If plane = light, display dark goals, if plane = dark, display light goals
        if ( plane === PLANE_LIGHT ) {
            PS.border( dark_goal_x, dark_goal_y, GOAL_WIDTH_BORDER );
        } else if ( plane === PLANE_DARK ) {
            PS.border( light_goal_x, light_goal_y, GOAL_WIDTH_BORDER );
        }

        // Play dialogue line for level after 2 seconds
        dialogueTimer = PS.timerStart( 120, playDialogue );

        // Set play to true
        play = true;
    }

    // Determines what the next level should be and starts it
    // Each game will have:
    // Two guaranteed tutorials (Levels 0 and 1)
    // One of five random easy levels (Levels 2-6)
    // One of five random medium levels (Levels 7-11)
    // One of five random hard levels (Levels 12-16)
    function nextLevel () {
        var data, e, m, h;

        data = levelData[ level ];

        // If current is first tutorial, go to next tutorial
        if ( level === 0 ) {
            level = 1;
            startLevel( level );
            return;
        }

        // If current level is second tutorial, pick a random easy level
        if ( level === 1 ) {

            e = PS.random( 5 );

            if ( e === 1 ) {
                level = 2;
                startLevel( level );
            } else if ( e === 2 ) {
                level = 3;
                startLevel( level );
            } else if ( e === 3 ) {
                level = 4;
                startLevel( level );
            } else if ( e === 4 ) {
                level = 5;
                startLevel( level );
            } else if ( e === 5 ) {
                level = 6;
                startLevel( level );
            }

            return;
        }

        // If current level is easy difficulty, pick a random medium level
        if ( data.difficulty === "easy" ) {

            m = PS.random( 5 );

            if ( m === 1 ) {
                level = 7;
                startLevel( level );
            } else if ( m === 2 ) {
                level = 8;
                startLevel( level );
            } else if ( m === 3 ) {
                level = 9;
                startLevel( level );
            } else if ( m === 4 ) {
                level = 10;
                startLevel( level );
            } else if ( m === 5 ) {
                level = 11;
                startLevel( level );
            }

            return;
        }

        // If current level is medium difficulty, pick a random hard level
        if ( data.difficulty === "medium" ) {

            h = PS.random( 5 );

            if ( h === 1 ) {
                level = 12;
                startLevel( level );
            } else if ( h === 2 ) {
                level = 13;
                startLevel( level );
            } else if ( h === 3 ) {
                level = 14;
                startLevel( level );
            } else if ( h === 4 ) {
                level = 15;
                startLevel( level );
            } else if ( h === 5 ) {
                level = 16;
                startLevel( level );
            }

            return;
        }

        // If current level is hard difficulty, end game
        if ( data.difficulty === "hard" ) {
            play = false;
            closer(); // Set up closing sequence
        }
    }

    // Moves light player bead on dark plane
    // Starts next level if both player beads are on goal beads
    function lightMove ( h, v ) {

        if ( play ) {
            var nx, ny;

            // Calculate proposed new location.
            nx = light_x + h;
            ny = light_y + v;

            // If the bead there is COLOR_IMPASSABLE (black), exit without moving.
            // If the bead is COLOR_LIGHT (white), exit without moving.

            if ( ( PS.color( nx, ny ) === COLOR_IMPASSABLE ) || ( PS.color( nx, ny ) === COLOR_LIGHT ) ) {
                return;
            }

            // Legal move, so change current light player bead location to its original color
            // If bead was on a light wall and dark bead is no longer cancelling that wall, change color to light
            // This only happens if player stopped light bead on unblocked light wall bead and moved dark bead out

            if ( ( PS.data( light_x, light_y ) === IS_WALL_LIGHT ) && ( ( light_x !== dark_x ) || ( light_y !== dark_y ) ) ) {
                PS.color( light_x, light_y, COLOR_LIGHT );
            } else {
                PS.color( light_x, light_y, light_last_color );
            }

            // If current bead unblocked a dark wall on light plane, block it again
            if ( PS.data( light_x, light_y ) === IS_WALL_DARK ) {
                PS.gridPlane( PLANE_LIGHT );
                PS.color( light_x, light_y, COLOR_DARK );

                // Change back to dark plane
                PS.gridPlane( PLANE_DARK );
            }

            // Remember color of new bead location before light player bead moves there
            light_last_color = PS.color( nx, ny );

            // Assign light player bead's color to the new location.
            PS.color ( nx, ny, COLOR_LIGHT );

            // Update light player bead's position
            light_x = nx;
            light_y = ny;

            // Set bead at same position on light plane to be light colored if it's a dark wall
            if ( PS.data ( nx, ny ) === IS_WALL_DARK ) {
                PS.gridPlane( PLANE_LIGHT );
                PS.color( nx, ny, COLOR_LIGHT );

                // Change back to dark plane
                PS.gridPlane( PLANE_DARK );
            }

            // If new location is goal, set is_light_goal to true, else false
            if ( ( light_x === light_goal_x ) && ( light_y === light_goal_y ) ) {
                is_light_goal = true;
            } else {
                is_light_goal = false;
            }

            // Go to next level if both goals have been reached
            if ( is_dark_goal && is_light_goal ) {
                nextLevel(); // Check what next level should be and start it

                // Set goal booleans to false
                is_dark_goal = false;
                is_light_goal = false;
            }
        }
    }

    // Moves dark player bead on light plane
    // Starts next level if both player beads are on goal beads
    function darkMove ( h, v ) {

        if ( play ) {
            var nx, ny;

            // Calculate proposed new location.
            nx = dark_x + h;
            ny = dark_y + v;

            // If the bead there is COLOR_IMPASSABLE (black), exit without moving.
            // If the bead is COLOR_DARK (dark gray), exit without moving.

            if ( ( PS.color( nx, ny ) === COLOR_IMPASSABLE ) || ( PS.color( nx, ny ) === COLOR_DARK ) ) {
                return;
            }

            // Legal move, so change current dark player bead location to its original color
            // If bead was on a dark wall and light bead is no longer cancelling that wall, change color to dark
            // This only happens if player stopped dark bead on unblocked dark wall bead and moved light bead out

            if ( ( PS.data( dark_x, dark_y ) === IS_WALL_DARK ) && ( ( light_x !== dark_x ) || ( light_y !== dark_y ) ) ) {
                PS.color( dark_x, dark_y, COLOR_DARK );
            } else {
                PS.color( dark_x, dark_y, dark_last_color );
            }

            // If current bead unblocked a light wall on dark plane, block it again
            if ( PS.data ( dark_x, dark_y ) === IS_WALL_LIGHT ) {
                PS.gridPlane( PLANE_DARK );
                PS.color( dark_x, dark_y, COLOR_LIGHT );

                // Change back to light plane
                PS.gridPlane( PLANE_LIGHT );
            }

            // Remember color of new bead location before dark player bead moves there
            dark_last_color = PS.color( nx, ny );

            // Assign dark player bead's color to the new location.
            PS.color ( nx, ny, COLOR_DARK );

            // Update dark player bead's position
            dark_x = nx;
            dark_y = ny;

            // Set bead at same position on dark plane to be dark colored if it's a light wall
            if ( PS.data ( nx, ny ) === IS_WALL_LIGHT ) {
                PS.gridPlane( PLANE_DARK );
                PS.color( nx, ny, COLOR_DARK );

                // Change back to light plane
                PS.gridPlane( PLANE_LIGHT );
            }


            // If new location is goal, set is_dark_goal to true, else false
            if ( ( dark_x === dark_goal_x ) && ( dark_y === dark_goal_y ) ) {
                is_dark_goal = true;
            } else {
                is_dark_goal = false;
            }

            // Go to next level if both goals have been reached
            if ( is_dark_goal && is_light_goal ) {
                nextLevel(); // Check what next level should be and start it

                // Set goal booleans to false
                is_dark_goal = false;
                is_light_goal = false;
            }
        }
    }

    // Use the loaded image data to initialize eye sprite and move it to the correct grid plane and location
    function spriteLoader( data ) {
        sprite_id = PS.spriteImage( data );
        PS.spritePlane( sprite_id, PLANE_SPRITE );
        PS.spriteMove( sprite_id, SPRITE_X, SPRITE_Y );
    }

    // Loader functions for music to save channel ID

    function musicClosedLoader( data ) {
        closed_id = data.channel; // save ID
    }

    function musicOpenLoader( data ) {
        open_id = data.channel; // save ID
    }

    function ambientDroneLoader( data ) {
        drone_id = data.channel; // save ID
    }

    // Called on every frame
    // Changes active plane every 5 seconds
    // Animates opening/closing of eye
    // Fades music in/out depending on which plane it is changing to
    // Play specific sound effect for eye animation
    function tick() {

        if ( play ) {

            // Add one to frameCount
            frameCount += 1;

            // If frameCount = FRAME_NUMBER, change active plane

            if ( ( frameCount === FRAME_NUMBER ) && ( PS.gridPlane() === PLANE_LIGHT ) ) {
                PS.alpha( PS.ALL, PS.ALL, 0 ); // Make PLANE_LIGHT transparent
                PS.border( dark_goal_x, dark_goal_y, 0 ); // Hide dark goal border
                PS.gridPlane( PLANE_DARK ); // Change active plane to PLANE_DARK
                PS.alpha( PS.ALL, PS.ALL, 255 ); // Make PLANE_DARK opaque
                PS.border( light_goal_x, light_goal_y, GOAL_WIDTH_BORDER  ); // Show light goal border
                PS.imageLoad( "images/spr_eye_closed.png", spriteLoader ); // Change eye sprite to closed
                frameCount = 0; // Reset frameCount
            }

            if ( ( frameCount === FRAME_NUMBER ) && ( PS.gridPlane() === PLANE_DARK ) ) {
                PS.alpha( PS.ALL, PS.ALL, 0 ); // Make PLANE_DARK transparent
                PS.border( light_goal_x, light_goal_y, 0 ); // Hide light goal border
                PS.gridPlane( PLANE_LIGHT ); // Change active plane to PLANE_LIGHT
                PS.alpha( PS.ALL, PS.ALL, 255 ); // Make PLANE_LIGHT opaque
                PS.border( dark_goal_x, dark_goal_y, GOAL_WIDTH_BORDER ); // Hide dark goal border
                PS.imageLoad( "images/spr_eye_open.png", spriteLoader ); // Change eye sprite to open
                frameCount = 0; // Reset frameCount
            }

            // Start eye animation for next phase a second before frameCount = FRAME_NUMBER
            // Fade out current music and fade in next track
            // If light plane, start closing eye (spr_blink_1)
            // If dark plane, start opening eye (spr_blink_3)
            // Play sound effect for closing eye (breathe_out) or opening eye (breathe_in)
            // Start making current plane less transparent and other plane more transparent

            if ( ( frameCount === ( FRAME_NUMBER - 60 ) ) && ( PS.gridPlane() === PLANE_LIGHT ) ) {
                PS.alpha( PS.ALL, PS.ALL, 191 ); // Decrease transparency of PLANE_LIGHT
                PS.gridPlane( PLANE_DARK ); // Change active plane to PLANE_DARK
                PS.alpha( PS.ALL, PS.ALL, 64 ); // Increase transparency of PLANE_DARK
                PS.gridPlane( PLANE_LIGHT ); // Change active plane back to PLANE_LIGHT
                PS.audioFade( open_id, MUSIC_VOLUME, 0, 2000 ); // Fade open_id out over 2 seconds
                PS.audioFade( closed_id, 0, MUSIC_VOLUME, 2000 ); // Fade closed_id in over 2 seconds
                PS.imageLoad( "images/spr_eye_blink_1.png", spriteLoader );
                PS.audioPlay( "breathe_out", { path : "sounds/sfx/", lock : true, volume : SFX_VOLUME } );
            }

            if ( ( frameCount === ( FRAME_NUMBER - 60 ) ) && ( PS.gridPlane() === PLANE_DARK ) ) {
                PS.alpha( PS.ALL, PS.ALL, 192 ); // Decrease transparency of PLANE_DARK
                PS.gridPlane( PLANE_LIGHT ); // Change active plane to PLANE_LIGHT
                PS.alpha( PS.ALL, PS.ALL, 64 ); // Increase transparency of PLANE_DARK
                PS.gridPlane( PLANE_DARK ); // Change active plane back to PLANE_DARK
                PS.audioFade( closed_id, MUSIC_VOLUME, 0, 2000 ); // Fade closed_id out over 2 seconds
                PS.audioFade( open_id, 0, MUSIC_VOLUME, 2000 ); // Fade open_id in over 2 seconds
                PS.imageLoad( "images/spr_eye_blink_3.png", spriteLoader );
                PS.audioPlay( "breathe_in", { path : "sounds/sfx/", lock : true, volume : SFX_VOLUME } );
            }

            // Continue eye animation when frameCount = FRAME_NUMBER - 40
            // Use half blink sprite for both planes (spr_blink_2)

            if ( frameCount === ( FRAME_NUMBER - 40 ) && ( PS.gridPlane() === PLANE_LIGHT ) ) {
                PS.alpha( PS.ALL, PS.ALL, 128 ); // Decrease transparency of PLANE_LIGHT
                PS.gridPlane( PLANE_DARK ); // Change active plane to PLANE_DARK
                PS.alpha( PS.ALL, PS.ALL, 128 ); // Increase transparency of PLANE_DARK
                PS.gridPlane( PLANE_LIGHT ); // Change active plane back to PLANE_LIGHT
                PS.imageLoad( "images/spr_eye_blink_2.png", spriteLoader );
            }

            if ( frameCount === ( FRAME_NUMBER - 40 ) && ( PS.gridPlane() === PLANE_DARK ) ) {
                PS.alpha( PS.ALL, PS.ALL, 128 ); // Decrease transparency of PLANE_DARK
                PS.gridPlane( PLANE_LIGHT ); // Change active plane to PLANE_LIGHT
                PS.alpha( PS.ALL, PS.ALL, 128 ); // Increase transparency of PLANE_DARK
                PS.gridPlane( PLANE_DARK ); // Change active plane to PLANE_DARK
                PS.imageLoad( "images/spr_eye_blink_2.png", spriteLoader );
            }

            // Continue eye animation when frameCount = FRAME_NUMBER - 20
            // If light plane, finish closing eye (spr_blink_3)
            // If dark plane, finish opening eye (spr_blink_1)

            if ( ( frameCount === ( FRAME_NUMBER - 20 ) ) && ( PS.gridPlane() === PLANE_LIGHT ) ) {
                PS.alpha( PS.ALL, PS.ALL, 64 ); // Decrease transparency of PLANE_LIGHT
                PS.gridPlane( PLANE_DARK ); // Change active plane to PLANE_DARK
                PS.alpha( PS.ALL, PS.ALL, 192 ); // Increase transparency of PLANE_DARK
                PS.gridPlane( PLANE_LIGHT ); // Change active plane back to PLANE_LIGHT
                PS.imageLoad( "images/spr_eye_blink_3.png", spriteLoader );
            }

            if ( ( frameCount === ( FRAME_NUMBER - 20 ) ) && ( PS.gridPlane() === PLANE_DARK ) ) {
                PS.alpha( PS.ALL, PS.ALL, 64 ); // Decrease transparency of PLANE_DARK
                PS.gridPlane( PLANE_LIGHT ); // Change active plane to PLANE_LIGHT
                PS.alpha( PS.ALL, PS.ALL, 192 ); // Increase transparency of PLANE_LIGHT
                PS.gridPlane( PLANE_DARK ); // Change active plane back to PLANE_DARK
                PS.imageLoad( "images/spr_eye_blink_1.png", spriteLoader );
            }
        }
    }

    // Called on every frame for the opening sequence
    // Animates eye opening and then stops openTimer
    function openTick() {

        // Add one to frameCount
        frameCount += 1;

        // Play opening dialogue after 10 frames

        if ( frameCount === 10 ) {
            PS.audioPlay( "line_opening_01", { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME } );
        }

        // Animate eye opening after 3 seconds

        if ( frameCount === 180 ) {
            PS.alpha( PS.ALL, PS.ALL, 192 ); // Decrease transparency of PLANE_DARK
            PS.gridPlane( PLANE_LIGHT ); // Change active plane to PLANE_LIGHT
            PS.alpha( PS.ALL, PS.ALL, 64 ); // Increase transparency of PLANE_DARK
            PS.gridPlane( PLANE_DARK ); // Change active plane back to PLANE_DARK
            PS.imageLoad( "images/spr_eye_blink_3.png", spriteLoader );

            // Start playing music and fade in open_id and drone_id
            PS.audioPlayChannel( closed_id, { volume : 0, loop : true } );
            PS.audioPlayChannel( open_id, { volume : 0, loop : true } );
            PS.audioPlayChannel( drone_id, { volume : 0, loop : true } );
            PS.audioFade( open_id, 0, MUSIC_VOLUME, 2000 ); // Fade open_id in over 2 seconds
            PS.audioFade( drone_id, 0, DRONE_VOLUME, 2000 ); // Fade open_id in over 2 seconds

            // Play sound effect
            PS.audioPlay( "breathe_in", { path : "sounds/sfx/", lock : true, volume : SFX_VOLUME } );
        }

        if ( frameCount === 200 ) {
            PS.alpha( PS.ALL, PS.ALL, 128 ); // Decrease transparency of PLANE_DARK
            PS.gridPlane( PLANE_LIGHT ); // Change active plane to PLANE_LIGHT
            PS.alpha( PS.ALL, PS.ALL, 128 ); // Increase transparency of PLANE_DARK
            PS.gridPlane( PLANE_DARK ); // Change active plane to PLANE_DARK
            PS.imageLoad( "images/spr_eye_blink_2.png", spriteLoader );
        }

        if ( frameCount === 220 ) {
            PS.alpha( PS.ALL, PS.ALL, 64 ); // Decrease transparency of PLANE_DARK
            PS.gridPlane( PLANE_LIGHT ); // Change active plane to PLANE_LIGHT
            PS.alpha( PS.ALL, PS.ALL, 192 ); // Increase transparency of PLANE_LIGHT
            PS.gridPlane( PLANE_DARK ); // Change active plane back to PLANE_DARK
            PS.imageLoad( "images/spr_eye_blink_1.png", spriteLoader );
        }

        // Animation over, so start first puzzle, stop openTimer, and reset frameCount

        if ( frameCount === 240 ) {

            // Start first puzzle
            startPuzzle();

            // Make light plane visible and load open eye sprite for first puzzle
            PS.gridPlane( PLANE_DARK );
            PS.alpha( PS.ALL, PS.ALL, 0 );
            PS.border( light_goal_x, light_goal_y, 0 );
            PS.gridPlane( PLANE_LIGHT );
            PS.alpha( PS.ALL, PS.ALL, 255 );
            PS.border( dark_goal_x, dark_goal_y, GOAL_WIDTH_BORDER );
            PS.imageLoad( "images/spr_eye_open.png", spriteLoader );

            // Stop openTimer
            PS.timerStop( openTimer );

            // Reset frameCount
            frameCount = 0;
        }

    }

    // Called on every frame for ending sequence
    // Animates eye closing and then stops closeTimer
    function closeTick() {

        // Add one to frameCount
        frameCount += 1;

        // Animate eye closing after 1 second and start fading music

        if ( frameCount === 60 ) {
            PS.alpha( PS.ALL, PS.ALL, 191 ); // Decrease transparency of PLANE_LIGHT
            PS.gridPlane( PLANE_DARK ); // Change active plane to PLANE_DARK
            PS.alpha( PS.ALL, PS.ALL, 64 ); // Increase transparency of PLANE_DARK
            PS.gridPlane( PLANE_LIGHT ); // Change active plane back to PLANE_LIGHT
            PS.imageLoad( "images/spr_eye_blink_1.png", spriteLoader );
            PS.audioPlay( "breathe_out", { path : "sounds/sfx/", lock : true, volume : SFX_VOLUME } ); // Play sound effect

            // Fade and stop music and ambient drone
            PS.audioFade( open_id, PS.CURRENT, 0, 2000, PS.audtioStop );
            PS.audioFade( closed_id, PS.CURRENT, 0, 2000, PS.audioStop );
            PS.audioFade( drone_id, PS.CURRENT, 0, 2000, PS.audioStop );
        }

        if ( frameCount === 80 ) {
            PS.alpha( PS.ALL, PS.ALL, 128 ); // Decrease transparency of PLANE_LIGHT
            PS.gridPlane( PLANE_DARK ); // Change active plane to PLANE_DARK
            PS.alpha( PS.ALL, PS.ALL, 128 ); // Increase transparency of PLANE_DARK
            PS.gridPlane( PLANE_LIGHT ); // Change active plane back to PLANE_LIGHT
            PS.imageLoad( "images/spr_eye_blink_2.png", spriteLoader );
        }

        if ( frameCount === 100 ) {
            PS.alpha( PS.ALL, PS.ALL, 64 ); // Decrease transparency of PLANE_LIGHT
            PS.gridPlane( PLANE_DARK ); // Change active plane to PLANE_DARK
            PS.alpha( PS.ALL, PS.ALL, 192 ); // Increase transparency of PLANE_DARK
            PS.gridPlane( PLANE_LIGHT ); // Change active plane back to PLANE_LIGHT
            PS.imageLoad( "images/spr_eye_blink_3.png", spriteLoader );
        }

        // Animation over

        if ( frameCount === 120 ) {

            // Make dark plane visible
            PS.alpha( PS.ALL, PS.ALL, 0 );
            PS.gridPlane( PLANE_DARK );
            PS.alpha( PS.ALL, PS.ALL, 255 );

            // Load closed eye sprite
            PS.imageLoad( "images/spr_eye_closed.png", spriteLoader );
        }

        // Play closing dialogue after 2.5 seconds

        if ( frameCount === 150 ) {
            PS.audioPlay( "line_closing_01", { path : "sounds/dialogue/", lock : true, volume : DIALOGUE_VOLUME } );
        }

        // Play ending stinger and end game after 6 seconds

        if ( frameCount === 360 ) {

            // Stop closeTimer
            PS.timerStop( closeTimer );

            // Play final stinger
            PS.audioPlay( "victory_stinger", { path : "sounds/music/", lock : true, volume : MUSIC_VOLUME } );
        }
    }

    // Sets up opening sequence
    function opener() {

        resetMap();

        // Make dark plane visible
        PS.gridPlane( PLANE_DARK );
        PS.alpha( PS.ALL, PS.ALL, 255 );

        // Load in closed eye sprite
        PS.imageLoad( "images/spr_eye_closed.png", spriteLoader );

        if ( beginning ) {

            // Start opening sequence timer
            openTimer = PS.timerStart( 1, openTick );
            beginning = false;
        }

    }

    // Sets up closing sequence
    function closer() {

        resetMap();

        // Make light plane visible
        PS.alpha( PS.ALL, PS.ALL, 0 );
        PS.gridPlane( PLANE_LIGHT );
        PS.alpha( PS.ALL, PS.ALL, 255 );

        // Load in closed eye sprite
        PS.imageLoad( "images/spr_eye_open.png", spriteLoader );

        // Stop tick timer
        PS.timerStop( tickTimer );

        // Reset frameCount
        frameCount = 0;

        // Set end to true so eye can be closed
        end = true;

        if ( end ) {

            // Start closing sequence timer
            closeTimer = PS.timerStart( 1, closeTick );
            end = false;
        }
    }

    // Starts the first puzzle after the opening sequence and starts tickTimer
    function startPuzzle () {

        // Start first level
        startLevel( level );

        // Start timer for calling tick on every frame
        tickTimer = PS.timerStart( 1, tick );
    }

    // The 'exports' object is used to define
    // variables and/or functions that need to be
    // accessible outside this function.

    var exports = {

        // G.init()
        // Initializes the game
        init : function () {
            "use strict";

            PS.gridSize( GRID_WIDTH, GRID_HEIGHT ); // Dimensions of grid, 32 x 32
            PS.gridColor( COLOR_BACKGROUND ); // Background color = light gray
            PS.gridShadow( true, COLOR_IMPASSABLE ); // Black shadow on grid
            PS.statusText( "" ); // No status line text

            // Load open and closed music tracks and ambient drone to different channels
            PS.audioLoad( "eye_closed", {
                lock : true,
                onLoad : musicClosedLoader,
                path : "sounds/music/"
            } );

            PS.audioLoad( "eye_open", {
                lock : true,
                onLoad : musicOpenLoader,
                path : "sounds/music/"
            } );

            PS.audioLoad( "low_drone", {
                lock : true,
                onLoad : ambientDroneLoader,
                path : "sounds/sfx/"
            } );

            // Set up opening sequence
            opener();

        },

        // If active plane is dark, move light player bead.
        // If active plane is light, move dark player bead.
        move: function ( h, v ) {

            if ( PS.gridPlane() === PLANE_DARK ) {
                lightMove( h, v );
            } else if ( PS.gridPlane() === PLANE_LIGHT ) {
                darkMove( h, v );
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
