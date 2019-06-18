// Assignment 10: Polish a Casual Game by Allison Steeves and Lisa Liao
// Sound effects and music created for The Underfrog by Ryan X. Messcher.
// The Underfrog is a casual puzzle game where the player must navigate shrinking lily pads to get to a goal.
// The player can only move onto adjacent lily pads, water beads, and goal beads (doesn't include diagonals).
// Landing on a water bead will reset the current level, while landing on a goal bead will progress to the next level.
// There are 8 different levels that get progressively harder.
// If data collection is turned on, a database will be initialized, and at the end of each level the following is reported:
// Level number
// Level attempt
// Win/fail state
// Total steps taken during that level (lily pads traversed)
// Database is sent to the specified email once the game is completed or if PS.shutdown() is called.
// Data collection is currently turned off, but can be turned on by setting COLLECT_DATA to true.

// Source Code:

// Global namespace variable G

var G = ( function() {

    // Constants

    var COLLECT_DATA = false; // Set to true if data is being collected, false if not
    var DATABASE = "underfrog_final"; // Database string id
    var EMAIL = "aesteeves"; // Email to send data to

    var GRID_WIDTH = 10; // Width of grid
    var GRID_HEIGHT = 9; // Height of grid

    var COLOR_PLAYER = 0xADD118; // Color of player (frog)
    var COLOR_LILY_PAD_1 = 0x76B6A7; // Color of type 1 lily pads (smallest/lightest)
    var COLOR_LILY_PAD_2 = 0x67A585; // Color of type 2 lily pads (medium)
    var COLOR_LILY_PAD_3 = 0x589360; // Color of type 3 lily pads (biggest/darkest)
    var COLOR_WATER = 0x81CFE0; // Color of water
    var COLOR_GRASS_1 = 0x387F0E; // Color of grass tint 1
    var COLOR_GRASS_2 = 0x488921; // Color of grass tint 2
    var COLOR_GRASS_3 = 0x549130; // Color of grass tint 3
    var COLOR_GOAL = 0x6A5800; // Color of level goals (logs)
    var COLOR_SHADOW = 0xB06E00; // Color of grid shadow
    var COLOR_BG = 0x583700; // Color of grid background
    var COLOR_TEXT = 0xF2D984; // Color of status line text
    var COLOR_GLYPH = 0x062E03; // Color of glyphs that appear on first level

    // Bead radius constants
    var RADIUS_LILY_PAD = 50; // Radius of lily pads
    var RADIUS_GOAL = 25; // Radius of goal bead
    var RADIUS_WATER = 0; // Radius of water beads
    var RADIUS_GRASS = 0; // Radius of grass beads

    // Bead border width constants - on lily pads to show player (different for each lily pad size)
    var BORDER_PLAYER_1 = 6; // Border width for type 1 lily pads
    var BORDER_PLAYER_2 = 10; // Border width for type 2 lily pads
    var BORDER_PLAYER_3 = 13; // Border width for type 3 lily pads

    // Bead scale constants
    var SCALE_LILY_PAD_1 = 60; // Scale of lily pad that will disappear after 1 player move within radius
    var SCALE_LILY_PAD_2 = 75; // Scale of lily pad that will disappear after 2 player moves within radius
    var SCALE_LILY_PAD_3 = 90; // Scale of lily pad that will disappear after 3 player moves within radius
    var SCALE_GOAL = 90; // Scale of goal bead
    var SCALE_WATER = 100; // Scale of water beads
    var SCALE_GRASS = 100; // Scale of grass beads
    var SCALE_GLYPH_1 = 50; // Scale of glyph that appears on lily pad type 1
    var SCALE_GLYPH_2 = 60; // Scale of glyph that appears on lily pad type 2
    var SCALE_GLYPH_3 = 70; // Scale of glyph that appears on lily pad type 3

    // Bead map data
    var MAP_LILY_PAD_1 = 1; // Value of lily pad with starting scale of SCALE_LILY_PAD_1
    var MAP_LILY_PAD_2 = 2; // Value of lily pad with starting scale of SCALE_LILY_PAD_2
    var MAP_LILY_PAD_3 = 3; // Value of lily pad with starting scale of SCALE_LILY_PAD_3
    var MAP_GRASS = 0; // Value of grass (impassable wall)
    var MAP_WATER = 9; // Value of water (player will die if they move onto this type of bead)

    var FADE_RATE_FAST = 15; // Fast fade rate for player bead movement (.25 seconds)
    var FADE_RATE_SLOW = 60; // Slow fade rate for level reset (1 second)
    var FADE_RATE_END = 120; // Slowest fade rate for ending (2 seconds)

    var DATA_GOAL = "goal"; // Bead data id for goal bead

    var LAST_LEVEL = 7; // Index of last level in level_data array

    // Sound effect names
    var MUSIC_INTRO = "underfrog_intro"; // Musical intro
    var MUSIC_LOOP = "underfrog_loop"; // Looping music
    var AMBIENT_NATURE = "underfrog_nature"; // Ambient nature noise
    var SOUND_JUMP = "underfrog_jump"; // Sfx for jumping
    var SOUND_VICTORY = "underfrog_log"; // Sfx for level completion
    var SOUND_SNAKE = "underfrog_snake"; // Sfx for error click on grass bead
    var SOUND_DEATH = "underfrog_splash"; // Sfx for player death

    // Volumes for sounds
    var VOLUME_SFX = .75;
    var VOLUME_MUSIC = 1;
    var VOLUME_AMBIENT = 1;

    var SOUND_FADE_RATE = 10000; // Fade rate for music/ambience (10 seconds)
    var SOUND_PATH = "sounds/"; // Path for all custom sounds

    // Array for layout of ending screen
    // 0 = grass
    // 1 = little frog
    // 2 = medium frog
    // 3 = large frog
    // 5 = "player" (smallest frog)
    // 9 = ground (goal color)
    var END_MAP = [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 9, 9, 9, 9, 9, 9, 0, 0,
        0, 9, 9, 2, 3, 3, 1, 9, 9, 0,
        0, 9, 1, 9, 9, 9, 9, 2, 9, 0,
        0, 9, 2, 9, 9, 9, 9, 2, 9, 0,
        0, 9, 2, 9, 5, 9, 9, 1, 9, 0,
        0, 0, 9, 9, 9, 9, 9, 9, 0, 0,
        0, 0, 0, 9, 9, 9, 9, 0, 0, 0
    ];

    // Variables
    var user = null; // Name of user currently playing (from dbInit() input)
    var play = false; // True if player has put in username
    var first_load = true; // True if the map has not been reset at all since initialization (only true at start)

    var player_steps = 0; // Counts how many steps the player takes on each attempt at a level (resets after every attempt)
    var attempt_number = 1; // Keeps track of how many times a player attempts a level (resets on level completion)

    var id_music_intro = ""; // Variable for saving channel id for music intro
    var id_music_loop = ""; // Variable for saving channel id for music loop
    var id_ambient = ""; // Variable for saving channel id for ambience

    var player_x; // Current x position of player
    var player_y; // Current y position of player

    var goal_x; // Current x position of goal
    var goal_y; // Current y position of goal

    var death_line = 1; // Keeps track of next death status line to be displayed (1, 2, 3, or 4)

    var level = 0; // Keeps track of current level (start at Level 0)
    var level_status = null; // Keeps track of current level's status line to refresh on movement

    var tutorial_steps = 0; // Counts steps on first level for tutorial text prompts

    // Array of objects that contains initialization data for each level
    // player_x, player_y = starting position of player
    // goal_x, goal_y = position of goal
    // (optional) status = status line text that appears at start of level (includes level par)
    // level_map = 10 x 9 array of bead type layout for each level where:
    // 1 = lily pad with starting scale of SCALE_LILY_PAD_1
    // 2 = lily pad with starting scale of SCALE_LILY_PAD_2
    // 3 = lily pad with starting scale of SCALE_LILY_PAD_3
    // 0 = grass (impassable wall)
    // 9 = water (player will die if they try to move onto this type of bead

    var level_data = [

        // Level 0
        {
            player_x : 4, player_y : 3,
            goal_x : 7, goal_y : 2,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 9, 9, 0, 0,
                0, 0, 0, 0, 1, 9, 9, 2, 0, 0,
                0, 0, 0, 0, 1, 9, 9, 2, 0, 0,
                0, 0, 0, 9, 2, 9, 9, 3, 0, 0,
                0, 0, 0, 9, 2, 3, 2, 2, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 1
        {
            player_x : 1, player_y : 4,
            goal_x : 8, goal_y : 4,
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 3, 3, 3, 3, 3, 3, 0, 0,
                0, 2, 3, 9, 9, 9, 9, 2, 3, 0,
                0, 1, 9, 9, 9, 9, 9, 9, 9, 0,
                0, 1, 2, 9, 9, 9, 9, 3, 3, 0,
                0, 0, 3, 3, 2, 2, 2, 2, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 2
        {
            player_x : 1, player_y : 2,
            goal_x : 8, goal_y : 1,
            status : "I bet you can finish this one in 12 jumps!",
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 9, 0,
                0, 1, 2, 0, 0, 2, 3, 2, 2, 0,
                0, 1, 3, 3, 2, 3, 9, 9, 3, 0,
                0, 2, 2, 3, 3, 2, 2, 2, 2, 0,
                0, 2, 9, 9, 9, 3, 9, 9, 3, 0,
                0, 2, 3, 2, 2, 3, 2, 3, 2, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 3
        {
            player_x : 7, player_y : 4,
            goal_x : 2, goal_y : 4,
            status : "The underfrog could do this in 9 jumps!",
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 3, 2, 3, 3, 0, 0, 0,
                0, 0, 2, 3, 0, 0, 3, 2, 0, 0,
                0, 0, 9, 1, 3, 3, 3, 2, 0, 0,
                0, 0, 3, 3, 0, 0, 2, 1, 0, 0,
                0, 0, 0, 2, 2, 3, 2, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 4
        {
            player_x : 1, player_y : 1,
            goal_x : 8, goal_y : 1,
            status : "That's a long ways to go... 19 jumps will do it!",
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 3, 2, 2, 0, 0, 2, 2, 9, 0,
                0, 3, 9, 3, 0, 0, 2, 9, 2, 0,
                0, 2, 0, 2, 9, 3, 3, 0, 3, 0,
                0, 2, 0, 2, 3, 3, 0, 0, 2, 0,
                0, 3, 0, 3, 9, 3, 3, 2, 2, 0,
                0, 2, 0, 3, 9, 3, 3, 9, 3, 0,
                0, 2, 2, 2, 0, 0, 3, 3, 2, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 5
        {
            player_x : 3, player_y : 7,
            goal_x : 6, goal_y : 1,
            status : "So many lily pads! Only takes 9 jumps though!",
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 3, 3, 2, 9, 0, 0, 0,
                0, 0, 3, 1, 3, 2, 2, 3, 0, 0,
                0, 3, 3, 1, 2, 1, 3, 2, 3, 0,
                0, 3, 3, 1, 3, 3, 3, 2, 3, 0,
                0, 3, 3, 3, 2, 1, 3, 3, 3, 0,
                0, 0, 3, 3, 3, 3, 3, 3, 0, 0,
                0, 0, 0, 3, 2, 3, 3, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 6
        {
            player_x : 2, player_y : 6,
            goal_x : 7, goal_y : 2,
            status : "9 jumps to hop around those islands!",
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 2, 3, 2, 1, 2, 9, 0, 0,
                0, 0, 2, 0, 2, 3, 2, 2, 0, 0,
                0, 0, 2, 0, 3, 2, 0, 1, 0, 0,
                0, 0, 1, 2, 2, 2, 0, 3, 0, 0,
                0, 0, 3, 1, 2, 2, 2, 2, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },

        // Level 7
        {
            player_x : 8, player_y : 1,
            goal_x : 1, goal_y : 1,
            status : "Try to navigate this swamp in 19 jumps!",
            level_map : [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 9, 2, 2, 2, 1, 2, 1, 1, 0,
                0, 3, 1, 2, 2, 3, 3, 9, 1, 0,
                0, 3, 3, 2, 0, 0, 2, 3, 2, 0,
                0, 9, 3, 2, 0, 0, 3, 9, 2, 0,
                0, 2, 3, 2, 0, 0, 2, 9, 2, 0,
                0, 3, 9, 3, 3, 9, 2, 3, 2, 0,
                0, 2, 2, 2, 2, 3, 2, 2, 2, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        }
    ];

    // Functions

    // Start the specified level
    function startLevel( val ) {
        var data, px, py, gx, gy;

        // Set play to false
        play = false;

        // Reset player_steps
        player_steps = 0;

        level = val;

        // Initialize level from data
        data = level_data[ level ];

        px = data.player_x;
        py = data.player_y;

        gx = data.goal_x;
        gy = data.goal_y;

        // Turn off all fades
        PS.fade( PS.ALL, PS.ALL, 0 );

        // Remove all glyphs
        PS.glyph( PS.ALL, PS.ALL, "" );

        // Save and display level status text if defined, otherwise set level_status to null
        if ( data.status !== undefined ) {
            level_status = data.status;
            PS.statusText( level_status );
        } else {
            level_status = null;
        }

        // Color map (grass, water, lily pads)
        colorMap( data.level_map );

        // Color bead background colors (for goal and lily pads so water still shows underneath)
        waterBackground();

        // Save goal coordinates and set up goal
        goal_x = gx;
        goal_y = gy;
        PS.bgAlpha( gx, gy, 255 ); // Make bead background opaque
        PS.radius( gx, gy, RADIUS_GOAL ); // Make bead correct radius for goal
        PS.scale( gx, gy, SCALE_GOAL ); // Scale bead to correct size for goal
        PS.color( gx, gy, COLOR_GOAL ); // Change bead to goal color
        PS.data( gx, gy, DATA_GOAL ); // Set data for goal bead to "goal" instead of water map value

        // Save player bead's location
        player_x = px;
        player_y = py;

        // If not first load and data collection is on (or data collection is off altogether), turn on fade for player
        if ( ( !first_load && COLLECT_DATA ) || !COLLECT_DATA ) {
            PS.fade( px, py, FADE_RATE_SLOW, { onEnd : playTrue } );
        }

        // Color player bead
        PS.color( px, py, COLOR_PLAYER );

        // Make sure no glyph on player bead
        PS.glyph( px, py, "" );

        // Set first load to false
        first_load = false;
    }

    // Sets up grass, water, and lily pad beads for the specific level
    // Draws player with correct lily pad border on all lily pads (but keeps player plane transparent)
    function colorMap( map ) {
        var x, y, num;

        // Color each bead according to map array
        for ( y = 0; y < GRID_HEIGHT; y += 1 ) {
            for ( x = 0; x < GRID_WIDTH; x += 1 ) {

                num = map[ ( y * GRID_WIDTH ) + x ]; // Get array number from position

                if ( num === MAP_GRASS ) {

                    generateGrass( x, y );

                } else if ( num === MAP_WATER ) {

                    PS.color( x, y, COLOR_WATER ); // Color given bead for water
                    PS.radius( x, y, RADIUS_WATER ); // Make bead correct radius for water
                    PS.scale( x, y, SCALE_WATER ); // Scale bead to correct size for water
                    PS.border( x, y, 0 ); // Get rid of border
                    PS.data( x, y, MAP_WATER ); // Set data to map value for water

                } else if ( num === MAP_LILY_PAD_1 ) {

                    PS.bgAlpha( x, y, 255 ); // Make bead background opaque
                    PS.radius( x, y, RADIUS_LILY_PAD ); // Make bead correct radius for lily pad
                    PS.scale( x, y, SCALE_LILY_PAD_1 ); // Scale bead to correct size for lily pad type 1
                    PS.color( x, y, COLOR_LILY_PAD_1 ); // Change bead to lily pad 1 color
                    PS.border( x, y, BORDER_PLAYER_1 ); // Set border width for lily pad type 1
                    PS.borderColor( x, y, COLOR_LILY_PAD_1 ); // Set border color to same as lily pad
                    PS.data( x, y, MAP_LILY_PAD_1 ); // Set data to map value for lily pad type 1

                    // If first or second level, put "1" glyph on lily pad
                    if ( ( level === 0 ) || ( level === 1 ) ) {
                        PS.glyphColor( x, y, COLOR_GLYPH );
                        PS.glyphScale( x, y, SCALE_GLYPH_1 );
                        PS.glyph( x, y, "1" );
                    }

                } else if ( num === MAP_LILY_PAD_2 ) {

                    PS.bgAlpha( x, y, 255 ); // Make bead background opaque
                    PS.radius( x, y, RADIUS_LILY_PAD ); // Make bead correct radius for lily pad
                    PS.scale( x, y, SCALE_LILY_PAD_2 ); // Scale bead to correct size for lily pad type 2
                    PS.color( x, y, COLOR_LILY_PAD_2 ); // Change bead to lily pad 2 color
                    PS.border( x, y, BORDER_PLAYER_2 ); // Set border width for lily pad type 2
                    PS.borderColor( x, y, COLOR_LILY_PAD_2 ); // Set border color to same as lily pad
                    PS.data( x, y, MAP_LILY_PAD_2 ); // Set data to map value for lily pad type 2

                    // If first or second level, put "2" glyph on lily pad
                    if ( ( level === 0 ) || ( level === 1 ) ) {
                        PS.glyphColor( x, y, COLOR_GLYPH );
                        PS.glyphScale( x, y, SCALE_GLYPH_2 );
                        PS.glyph( x, y, "2" );
                    }

                } else if ( num === MAP_LILY_PAD_3 ) {

                    PS.bgAlpha( x, y, 255 ); // Make bead background opaque
                    PS.radius( x, y, RADIUS_LILY_PAD ); // Make bead correct radius for lily pad
                    PS.scale( x, y, SCALE_LILY_PAD_3 ); // Scale bead to correct size for lily pad type 3
                    PS.color( x, y, COLOR_LILY_PAD_3 ); // Change bead to lily pad 3 color
                    PS.border( x, y, BORDER_PLAYER_3 ); // Set border width for lily pad type 3
                    PS.borderColor( x, y, COLOR_LILY_PAD_3 ); // Set border color to same as lily pad
                    PS.data( x, y, MAP_LILY_PAD_3 ); // Set data to map value for lily pad type 3

                    // If first or second level, put "3" glyph on lily pad
                    if ( ( level === 0 ) || ( level === 1 ) ) {
                        PS.glyphColor( x, y, COLOR_GLYPH );
                        PS.glyphScale( x, y, SCALE_GLYPH_3 );
                        PS.glyph( x, y, "3" );
                    }
                }
            }
        }
    }

    // Randomizes color of grass and colors specified bead that color
    function generateGrass( x, y ) {
        var random, color_grass;

        // If not first load of the game, turn on fade for grass beads
        if ( !first_load ) {
            PS.fade( x, y, FADE_RATE_SLOW );
        }

        // Pick number between 1 and 3
        random = PS.random( 3 );

        // Determine which grass color to use based on random result
        if ( random === 1 ) {
            color_grass = COLOR_GRASS_1;
        } else if ( random === 2 ) {
            color_grass = COLOR_GRASS_2;
        } else if ( random === 3 ) {
            color_grass = COLOR_GRASS_3
        }

        PS.color( x, y, color_grass ); // Color given bead
        PS.radius( x, y, RADIUS_GRASS ); // Make bead correct radius for grass
        PS.scale( x, y, SCALE_GRASS ); // Scale bead to correct size for grass
        PS.border( x, y, 0 ); // Get rid of border
        PS.data( x, y, MAP_GRASS ); // Set data to map value for grass
    }

    // Colors bead background of all beads to be water color
    function waterBackground() {
        var x, y;

        for ( y = 0; y < GRID_HEIGHT; y += 1 ) {
            for ( x = 0; x < GRID_WIDTH; x += 1 ) {
                PS.bgColor( x, y, COLOR_WATER );
            }
        }
    }

    // Shrink the lily pad at the given coordinate by one stage and change it's data value
    // Change properties of type 3 to type 2, type 2 to type 1, and type 1 to water
    function shrinkLily( x, y ) {

        if ( PS.data( x, y ) === MAP_LILY_PAD_3 ) {

            PS.scale( x, y, SCALE_LILY_PAD_2 );
            PS.color( x, y, COLOR_LILY_PAD_2 );
            PS.border( x, y, BORDER_PLAYER_2 );
            PS.borderColor( x, y, COLOR_LILY_PAD_2 );
            PS.data( x, y, MAP_LILY_PAD_2 );

            // If first or second level, change glyph from 3 to 2
            if ( ( level === 0 ) || ( level === 1 ) ) {
                PS.glyphScale( x, y, SCALE_GLYPH_2 );
                PS.glyph( x, y, "2" );
            }

        } else if ( PS.data( x, y ) === MAP_LILY_PAD_2 ) {

            PS.scale( x, y, SCALE_LILY_PAD_1 );
            PS.color( x, y, COLOR_LILY_PAD_1 );
            PS.border( x, y, BORDER_PLAYER_1 );
            PS.borderColor( x, y, COLOR_LILY_PAD_1 );
            PS.data( x, y, MAP_LILY_PAD_1 );

            // If first or second level, change glyph from 2 to 1
            if ( ( level === 0 ) || ( level === 1 ) ) {
                PS.glyphScale( x, y, SCALE_GLYPH_1 );
                PS.glyph( x, y, "1" );
            }

        } else if ( PS.data( x, y ) === MAP_LILY_PAD_1 ) {

            PS.color( x, y, PS.bgColor( x, y ) );
            PS.borderColor( x, y, PS.bgColor( x, y ) );
            PS.data( x, y, MAP_WATER );

            // If first or second level, remove glyph
            if ( ( level === 0 ) || ( level === 1 ) ) {
                PS.glyph( x, y, "" );
            }

        }
    }

    // Set play to true
    function playTrue() {
        play = true;
    }

    // Starts playing intro music and saves music intro channel id
    // Once intro is done, start playing loop
    function playIntro( data ) {
        id_music_intro = data.channel; // Save id
        PS.audioPlayChannel( id_music_intro, { volume : 0, onEnd : playLoop } ); // Start playing channel at 0 volume
        PS.audioFade( id_music_intro, PS.CURRENT, VOLUME_MUSIC, SOUND_FADE_RATE ); // Fade in music
    }

    // Starts playing ambience and saves ambient channel id
    function playAmbient( data ) {
        id_ambient = data.channel; // Save id
        PS.audioPlayChannel( id_ambient, { volume : 0, loop : true } ); // Start playing channel at 0 volume
        PS.audioFade( id_ambient, PS.CURRENT, VOLUME_AMBIENT, SOUND_FADE_RATE ); // Fade in ambience
    }

    // Saves music loop channel id (but it's not played until intro is over)
    function loadLoop( data ) {
        id_music_loop = data.channel; // Save id
    }

    // Play looping music
    function playLoop() {
        PS.audioStop( id_music_intro ); // Stop intro channel
        PS.audioPlayChannel( id_music_loop, { volume : VOLUME_MUSIC, loop : true } ); // Start playing channel
    }

    // Stops the given channel
    function stopChannel( channel ) {
        PS.audioStop( channel );
    }

    // Gets player username for database and sets play to true
    function getName( id, name ) {
        user = name; // Save user's name
        PS.statusText( "Jump on adjacent lily pads to get home!" ); // Status line starting text
        playTrue(); // Set play to true
    }

    // Ends the game
    function endGame() {

        PS.fade( PS.ALL, PS.ALL, FADE_RATE_END ); // Turn on fades for all beads
        PS.borderFade( PS.ALL, PS.ALL, FADE_RATE_END ); // Turns on border fades for all beads

        // Reset all radii, scales, background colors, and borders
        PS.radius( PS.ALL, PS.ALL, 0 );
        PS.scale( PS.ALL, PS.ALL, 100 );
        PS.bgColor( PS.ALL, PS.ALL, COLOR_GOAL );
        PS.border( PS.ALL, PS.ALL, 0 );
        PS.borderColor( PS.ALL, PS.ALL, COLOR_GOAL );

        colorEnd( END_MAP );

        PS.statusText( "You did it, underfrog! Welcome home!" ); // Change status line text to win text

        // In case player beats game before music intro transitions into music loop, fade out intro and delete channel
        PS.audioFade( id_music_intro, PS.CURRENT, 0, SOUND_FADE_RATE, stopChannel );

        PS.audioFade( id_music_loop, PS.CURRENT, 0, SOUND_FADE_RATE, stopChannel ); // Fade out music loop
        PS.audioFade( id_ambient, PS.CURRENT, 0, SOUND_FADE_RATE, stopChannel ); // Fade out ambience

        // Send database
        if ( PS.dbValid( DATABASE ) && ( level === LAST_LEVEL ) ) {
            PS.dbSend( DATABASE, EMAIL );
            PS.dbErase( DATABASE );
        }
    }

    // Colors grid to ending screen (END_MAP)
    function colorEnd( map ) {
        var x, y, num;

        // Color each bead according to map array
        for ( y = 0; y < GRID_HEIGHT; y += 1 ) {
            for ( x = 0; x < GRID_WIDTH; x += 1 ) {

                num = map[ ( y * GRID_WIDTH ) + x ]; // Get array number from position

                if ( num === MAP_GRASS ) {

                    generateGrass( x, y );

                } else if ( num === 1 ) {

                    PS.bgAlpha( x, y, 255 ); // Make bead background opaque
                    PS.radius( x, y, RADIUS_LILY_PAD ); // Make bead correct radius for small frog
                    PS.scale( x, y, SCALE_LILY_PAD_1 ); // Scale bead to correct size for small frog
                    PS.color( x, y, COLOR_PLAYER ); // Change bead to frog (player) color

                } else if ( num === 2 ) {

                    PS.bgAlpha( x, y, 255 ); // Make bead background opaque
                    PS.radius( x, y, RADIUS_LILY_PAD ); // Make bead correct radius for medium frog
                    PS.scale( x, y, SCALE_LILY_PAD_2 ); // Scale bead to correct size for medium frog
                    PS.color( x, y, COLOR_PLAYER ); // Change bead to frog (player) color

                } else if ( num === 3 ) {

                    PS.bgAlpha( x, y, 255 ); // Make bead background opaque
                    PS.radius( x, y, RADIUS_LILY_PAD ); // Make bead correct radius for large frog
                    PS.scale( x, y, SCALE_LILY_PAD_3 ); // Scale bead to correct size for large frog
                    PS.color( x, y, COLOR_PLAYER ); // Change bead to frog (player) color

                } else if ( num === 5 ) {

                    PS.bgAlpha( x, y, 255 ); // Make bead background opaque
                    PS.radius( x, y, RADIUS_LILY_PAD ); // Make bead correct radius for small lily pad
                    PS.scale( x, y, SCALE_LILY_PAD_1); // Scale bead to correct size for small lily pad
                    PS.border( x, y, BORDER_PLAYER_1 ); // Give border correct width to show player
                    PS.borderColor( x, y, COLOR_GOAL ); // Make border color same as background
                    PS.color( x, y, COLOR_PLAYER ); // Change bead to frog (player) color

                } else if ( num === 9 ) {

                    PS.color( x, y, COLOR_GOAL );

                }
            }
        }
    }

    // Functions accessible outside of G function
    var exports = {

        // G.init()
        // Initializes the game
        init : function () {
            "use strict";

            PS.gridSize( GRID_WIDTH, GRID_HEIGHT ); // Dimensions of grid
            PS.gridColor( COLOR_BG ); // Background color
            PS.gridShadow( true, COLOR_SHADOW ); // Grid shadow
            PS.statusColor( COLOR_TEXT ); // Status line text color
            PS.border( PS.ALL, PS.ALL, 0 ); // Turn off borders for all beads to

            // Start first level (Level 0)
            startLevel( level );

            // Initialize database if COLLECT_DATA is true, otherwise start without database
            if ( COLLECT_DATA ) {
                PS.dbInit( DATABASE, {
                    login : getName
                } );
            } else if ( !COLLECT_DATA ) {
                PS.statusText( "Jump on adjacent lily pads to get home!" ); // Status line starting text
            }

            // Load in and play music intro
            PS.audioLoad( MUSIC_INTRO, {
                lock : true,
                onLoad : playIntro,
                path : SOUND_PATH
            } );

            // Load in and play ambience
            PS.audioLoad( AMBIENT_NATURE, {
                lock : true,
                onLoad : playAmbient,
                path : SOUND_PATH
            } );

            // Load in music loop
            PS.audioLoad( MUSIC_LOOP, {
                lock : true,
                onLoad : loadLoop,
                path : SOUND_PATH
            } );

        },

        // G.touch( x, y )
        // Called whenever a bead is clicked/tapped
        // Determines if valid move (if bead is adjacent, but not at the diagonal) and then handles movement/shrinking
        touch : function ( x, y ) {
            var x_adjacent, y_adjacent, at_diagonal, same_location, h, v, nx, ny, data, random;

            // Only allow movement if play is true
            if ( play === true ) {

                // x_adjacent is true if x value of bead touched is 1 or 0 away from player
                x_adjacent = ( ( Math.abs( player_x - x ) === 1 ) || ( ( player_x - x ) === 0 ) );

                // y_adjacent is true if y value of bead touched is 1 or 0 away from player
                y_adjacent = ( ( Math.abs( player_y - y ) === 1 ) || ( ( player_y - y ) === 0 ) );

                // at_diagonal is true if both x and y values are 1 away
                at_diagonal = ( ( Math.abs( player_x - x ) === 1 ) && ( Math.abs( player_y - y ) === 1 ) );

                // same_location is true if the bead clicked is where the player already is
                same_location = ( ( player_x === x ) && ( player_y === y ) );

                // If x value is adjacent or the same and y value is adjacent or the same (BUT NOT BOTH!), move is valid
                if ( x_adjacent && y_adjacent && !at_diagonal && !same_location ) {

                    // Set horizontal and vertical movement variables (will either be -1, 0, or 1)
                    h = ( x - player_x ); // Horizontal movement = x value of new bead - x value of player current location
                    v = ( y - player_y ); // Vertical movement = y value of new bead - y value of player current location

                    // Calculate new location
                    nx = player_x + h;
                    ny = player_y + v;

                    // Get map data for bead
                    data = PS.data( nx, ny );

                    // If new location is a water bead, player dies and level is reset
                    // Report data on level attempt
                    if ( data === MAP_WATER ) {

                        // Turn off fade for old location
                        PS.fade( player_x, player_y, 0 );

                        // Report on level and attempt number, steps, fail state
                        if ( PS.dbValid( DATABASE ) ) {
                            PS.dbEvent( DATABASE, "level", level, "attempt", attempt_number, "win/fail", "fail", "steps", player_steps );
                        }

                        attempt_number += 1; // Add one to attempt_number

                        // If first level, reset tutorial_steps (so tutorial status text will appear again)
                        if ( level === 0 ) {
                            tutorial_steps = 0;
                        }

                        // Play water death sound effect
                        PS.audioPlay( SOUND_DEATH, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );

                        startLevel( level ); // Restart level

                        // Display one of the four death status lines (and update death_line for next one)
                        if ( death_line === 1 ) {
                            PS.statusText( "Uh oh... you drowned. Try again!" );
                            death_line = 2;
                        } else if ( death_line === 2 ) {
                            PS.statusText( "The underfrog can't swim." );
                            death_line = 3;
                        } else if ( death_line === 3 ) {
                            PS.statusText( "Be a little more careful next time!" );
                            death_line = 4;
                        } else if ( death_line === 4 ) {
                            PS.statusText( "Sploosh! Someone took a dip!" );
                            death_line = 1;
                        }

                    }

                    // If new location is a grass bead, play error sound and display error text
                    if ( data === MAP_GRASS ) {
                        PS.statusText( "Not on the grass! There are snakes!" );
                        PS.audioPlay( SOUND_SNAKE, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );
                    }

                    // If new location is goal, go to next level
                    // Report data on level success
                    if ( data === DATA_GOAL ) {

                        // Turn off fade for old location
                        PS.fade( player_x, player_y, 0 );

                        // Report on level and attempt number, steps, win state
                        if ( PS.dbValid( DATABASE ) ) {
                            PS.dbEvent( DATABASE, "level", level, "attempt", attempt_number, "win/fail", "win", "steps", player_steps );
                        }

                        // Play victory sound effect
                        PS.audioPlay( SOUND_VICTORY, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );

                        // If first level, change status line
                        if ( level === 0 ) {
                            PS.statusText( "Awesome! Keep it up!" );
                        }

                        // If goal of last level, end the game, otherwise go to next level
                        if ( level === LAST_LEVEL ) {
                            endGame();
                        } else {
                            level += 1; // Add one to level
                            attempt_number = 1; // Set attempt_number back to one for next level
                            startLevel( level ); // Start next level
                        }
                    }

                    // If new location is a lily pad...
                    // Move player to that lily pad
                    // Shrink all lily pads in a 3x3 grid (8 surrounding beads) around new location
                    // Add 1 to player_steps
                    if ( ( data === MAP_LILY_PAD_1 ) || ( data === MAP_LILY_PAD_2 ) || ( data === MAP_LILY_PAD_3 ) ) {

                        // Turn off fade for old location
                        PS.fade( player_x, player_y, 0 );

                        // Turn off glyph for new location
                        PS.glyph( nx, ny, "" );

                        // Turn on fade for new location and don't allow movement until it's done
                        play = false;
                        PS.fade( nx, ny, FADE_RATE_FAST, { onEnd : playTrue } );

                        // Play jump sound effect
                        PS.audioPlay( SOUND_JUMP, { path : SOUND_PATH, lock : true, volume : VOLUME_SFX } );

                        // Change new location to player color
                        PS.color( nx, ny, COLOR_PLAYER );

                        // Update player location
                        player_x = nx;
                        player_y = ny;

                        // Add one to player_steps
                        player_steps += 1;

                        // Shrink all lily pads (by one stage) in a 3x3 grid (8 surrounding beads) around the player's updated location
                        shrinkLily( nx , ( ny - 1 ) ); // One bead up
                        shrinkLily( nx , ( ny + 1 ) ); // One bead down
                        shrinkLily( ( nx - 1 ) , ny ); // One bead left
                        shrinkLily( ( nx + 1 ) , ny ); // One bead right
                        shrinkLily( ( nx - 1 ) , ( ny - 1 ) ); // One bead left and up
                        shrinkLily( ( nx + 1 ) , ( ny + 1 ) ); // One bead right and down
                        shrinkLily( ( nx - 1 ) , ( ny + 1 ) ); // One bead left and down
                        shrinkLily( ( nx + 1 ) , ( ny - 1 ) ); // One bead right and up

                        // If level_status is defined, change status text to level_status
                        // Refreshes level status text on first movement after level reset text
                        if ( level_status !== null ) {
                            PS.statusText( level_status );
                        }

                        // If first level, add one to tutorial_steps and change status line
                        if ( level === 0 ) {
                            tutorial_steps += 1;

                            if ( tutorial_steps === 2 ) {
                                PS.statusText( "Lily pads around you shrink when you jump." );
                            } else if ( tutorial_steps === 3 ) {
                                PS.statusText( "Small, light lily pads can shrink only once." );
                            } else if ( tutorial_steps === 4 ) {
                                PS.statusText( "Medium lily pads can shrink twice." );
                            } else if ( tutorial_steps === 5 ) {
                                PS.statusText( "And big, dark lily pads can shrink three times!" );
                            } else if ( tutorial_steps === 7 ) {
                                PS.statusText( "Be careful not to jump in the water..." );
                            } else if ( tutorial_steps === 9 ) {
                                PS.statusText( "...unless all the lily pads are gone!" );
                            }
                        }

                    }
                }
            }
        },

        // G.shutdown()
        // If database is valid, send to email and erase when shutdown is called
        shutdown: function () {
            "use strict";

            if ( PS.dbValid( DATABASE ) ) {
                PS.dbSend( DATABASE, EMAIL );
                PS.dbErase( DATABASE );
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

    G.touch( x, y )
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
};

PS.keyUp = function( key, shift, ctrl, options ) {
    "use strict";
};

PS.input = function( sensors, options ) {
    "use strict";
};

PS.shutdown = function( options ) {
    "use strict";

    G.shutdown();
};