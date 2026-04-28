using NoSmokeJourney.Core.Enums;

namespace NoSmokeJourney.Core.Entities;

public class AddictionTest : BaseEntity
{
    public int SmokerId { get; set; }
    public Smoker Smoker { get; set; } = null!;

    // Fagerström Test Questions (0-10 scale)
    public int Question1Score { get; set; } // How soon after waking do you smoke?
    public int Question2Score { get; set; } // Do you find it difficult to refrain from smoking?
    public int Question3Score { get; set; } // Which cigarette would you hate most to give up?
    public int Question4Score { get; set; } // How many cigarettes/day do you smoke?
    public int Question5Score { get; set; } // Do you smoke more frequently in the morning?
    public int Question6Score { get; set; } // Do you smoke when ill?

    public int TotalScore { get; set; }
    public AddictionLevel AddictionLevel { get; set; }
    public string? Advice { get; set; }
    public DateTime TestDate { get; set; } = DateTime.UtcNow;
}
