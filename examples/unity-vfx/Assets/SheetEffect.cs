using System;
using UnityEngine;

// Test-scene adapter for trusted bundled exports, not an arbitrary asset importer.
public sealed class SheetEffect : MonoBehaviour
{
    [Serializable] public class Point { public float x, y; }
    [Serializable] public class Frame { public int x, y, width, height; public float durationMs; }
    [Serializable] public class Sheet { public int width, height; public float durationSeconds; public bool loop; public Point pivotPixels; public Frame[] frames; }
    public Sheet Data { get; private set; }
    public SpriteRenderer Renderer { get; private set; }
    public int FrameIndex { get; private set; }
    public bool Playing { get; private set; }
    public bool Paused;
    public float Age { get; private set; }
    public float FinishTime { get; private set; }
    public int Completions { get; private set; }
    Sprite[] sprites;

    public void Configure(string name)
    {
        Data = JsonUtility.FromJson<Sheet>(Resources.Load<TextAsset>(name).text);
        var texture = Resources.Load<Texture2D>(name);
        sprites = new Sprite[Data.frames.Length];
        for (int i = 0; i < sprites.Length; i++) {
            var f = Data.frames[i];
            // Export rectangles and pivot start at the top; Unity's texture origin is bottom-left.
            sprites[i] = Sprite.Create(texture, new Rect(f.x, Data.height-f.y-f.height, f.width, f.height),
                new Vector2(Data.pivotPixels.x/f.width, 1-Data.pivotPixels.y/f.height), 100);
        }
        Renderer = gameObject.AddComponent<SpriteRenderer>();
        Renderer.sprite = sprites[0]; Renderer.enabled = false;
    }
    public void Restart() { Age=0; FrameIndex=0; Paused=false; Playing=true; Renderer.sprite=sprites[0]; Renderer.enabled=true; }
    public void Cancel() { Playing=false; Renderer.enabled=false; }
    void Update()
    {
        if (!Playing || Paused) return;
        Age += Time.deltaTime;
        if (!Data.loop && Age >= Data.durationSeconds) {
            FinishTime=Time.realtimeSinceStartup; Completions++; Cancel(); return;
        }
        float t=Data.loop ? Age%Data.durationSeconds : Age, end=0;
        for (int i=0;i<sprites.Length;i++) {
            end+=Data.frames[i].durationMs/1000;
            if (t<end) { FrameIndex=i; Renderer.sprite=sprites[i]; break; }
        }
    }
    void OnDestroy() { if(sprites!=null) foreach(var sprite in sprites) Destroy(sprite); }
}
