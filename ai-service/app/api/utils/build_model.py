import torch
import torch.nn as nn
import torch.nn.functional as F

def build_model(input_dim):
    return PoseAutoEncoder(input_dim)

class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=500):
        super().__init__()

        pe = torch.zeros(max_len, d_model)

        position = torch.arange(
            0, max_len,
            dtype=torch.float
        ).unsqueeze(1)

        div_term = torch.exp(
            torch.arange(0, d_model, 2).float()
            * (-torch.log(torch.tensor(10000.0)) / d_model)
        )

        pe[:,0::2] = torch.sin(position * div_term)
        pe[:,1::2] = torch.cos(position * div_term)

        self.register_buffer(
            "pe",
            pe.unsqueeze(0)
        )

    def forward(self,x):
        return x + self.pe[:,:x.size(1)]

class PoseAutoEncoder(nn.Module):
    def __init__(self, input_dim):
        super().__init__()

        # Encoder with projection layer and LayerNorm
        self.linear = nn.Linear(input_dim, 128)
        self.layernorm = nn.LayerNorm(128)
        self.position = PositionalEncoding(128)

        # Transformer Encoder with dropout = 0.2
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=128,
            nhead=8,
            dropout=0.2,
            batch_first=True
        )

        self.transformer = nn.TransformerEncoder(
            encoder_layer,
            num_layers=2
        )

        # Bottleneck (latent space of 64)
        self.bottleneck_encode = nn.Linear(128, 64)
        self.bottleneck_decode = nn.Linear(64, 128)

        # Decoder
        self.decoder = nn.Linear(128, input_dim)

    def forward(self, x):
        x = self.linear(x)          # (B, T, input_dim) -> (B, T, 128)
        x = self.layernorm(x)       # (B, T, 128)
        x = self.position(x)        # (B, T, 128)
        x = self.transformer(x)     # (B, T, 128)

        # Bottleneck representation
        x = F.relu(self.bottleneck_encode(x))  # (B, T, 64)
        x = F.relu(self.bottleneck_decode(x))  # (B, T, 128)

        reconstructed = self.decoder(x)   # (B, T, input_dim)

        return reconstructed