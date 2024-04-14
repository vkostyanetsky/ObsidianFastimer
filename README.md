# Obsidian Fastimer ⏱️ 🍔 🍺

[![ESLint](https://github.com/vkostyanetsky/ObsidianFastimer/actions/workflows/eslint.yml/badge.svg)](https://github.com/vkostyanetsky/ObsidianFastimer/actions/workflows/eslint.yml)

It is a plugin for [Obsidian](https://obsidian.md) designed to help you monitor your [fasting intervals](https://en.wikipedia.org/wiki/Intermittent_fasting).  

## 🙂 How to use it?

The idea is simple: when you start a new fast and want to track it, you add a `fastimer` code block. You can do this using "Insert fasting tracker" command or manually.

For example:

````
```fastimer

```
````

In the block, you set a date and time of the moment when you started. Again, you can do this using "Insert current date & time" command or manually.

For example:

````
```fastimer
2024-02-06 18:50
```
````

The plugin takes the code block and shows elapsed time, remaining time, and something like a progress bar to visualize your spilled blood, sweat, and tears :) For example, something like this:

> Started **today, 18:50**; should be completed **tomorrow, 10:50**.
> 
> Duration: **50m** (left: **15h 9m**)
> 
> `##------------------------------------- 5%`
> 
> Fasting zones:
> 
> 1. Anabolic zone started today, 18:34 ← you are here
> 2. Catabolic zone will start today, 22:34
> 3. Fat burning zone will start tomorrow, 10:34
> 4. Ketosis zone will start tomorrow, 18:34
> 5. Deep ketosis zone will start 3 days later, 18:34

Everything above updates when a block is being rendered. To trigger this, you can edit the block or reopen the note.

To mark an active fast as finished, you can add the date and time of the moment to the same block. There is still "Insert current date & time" command to do so. In addition, you can also use the "Insert current date" command of the core plugin Templates (if you prefer this way, do not forget to change the date format to `YYYY-MM-DD HH:mm`).

````
```fastimer
2024-02-06 18:50
2024-02-07 15:00
```
````

## 🤔 Questions

### How do I set a fasting interval's length?

It is assumed that the length of a regular fast is 16 hours, since it is pretty popular. However, you can change the default value in the plugin's settings or set it directly for one specific fast. 

Below, we are going to fast for 18 hours:

````
```fastimer
18
2024-02-06 18:50
```
````

### Why not to use properties to store fast data?

Something like `fast_started_at`, `fast_stopped_at`, `fast_length` properties in a daily note? Yeah, this idea came to my mind, but I have a few reasons not to do it. Here they are:

1. You need a code block in a note to see a fast overview anyway, so it makes more sense to use the block to store the data it renders.
2. Storing the data in a code block provides you with the opportunity to have one note for all the fasts you participate in case it is convenient for you.
3. Adding several semantically connected properties to each daily note makes the flow more complex: you have to remember that they are related to each other. Unfortunately, at this moment, there is no property grouping feature in Obsidian.