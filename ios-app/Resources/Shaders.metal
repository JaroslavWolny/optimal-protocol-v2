#include <metal_stdlib>
using namespace metal;

struct VertexInput {
    float4 position [[attribute(0)]];
    float2 texcoord [[attribute(1)]];
};

struct VertexOutput {
    float4 position [[position]];
    float2 texcoord;
};

vertex VertexOutput retro_vertex(VertexInput in [[stage_in]]) {
    VertexOutput out;
    out.position = in.position;
    out.texcoord = in.texcoord;
    return out;
}

fragment float4 retro_fragment(VertexOutput in [[stage_in]],
                               texture2d<float> colorTexture [[texture(0)]],
                               constant float &time [[buffer(0)]]) {
    constexpr sampler textureSampler(mag_filter::nearest, min_filter::nearest);
    
    // 1. Pixelation
    float2 resolution = float2(colorTexture.get_width(), colorTexture.get_height());
    float pixelSize = 4.0; // Adjust for more/less pixelation
    float2 uv = in.texcoord;
    uv = floor(uv * resolution / pixelSize) / (resolution / pixelSize);
    
    float4 color = colorTexture.sample(textureSampler, uv);
    
    // 2. Scanlines
    float scanline = sin(in.texcoord.y * resolution.y * 0.5 + time * 10.0) * 0.1;
    color.rgb -= scanline;
    
    // 3. Noise
    float noise = fract(sin(dot(uv * time, float2(12.9898, 78.233))) * 43758.5453);
    color.rgb += (noise - 0.5) * 0.05;
    
    // 4. Vignette
    float2 center = float2(0.5, 0.5);
    float dist = distance(in.texcoord, center);
    float vignette = smoothstep(0.8, 0.2, dist * 1.2);
    color.rgb *= vignette;
    
    // 5. Color Grading (Doom-like contrast)
    color.rgb = pow(color.rgb, float3(1.2)); // Increase contrast
    
    return color;
}
