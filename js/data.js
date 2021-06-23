const scale = ['G', 'B', 'C', 'D', 'E'];
// ['G', 'B', 'D', 'F#', 'A'];
// ['F','A','C','Eb','G'];

const octaves = ['2', '3', '4'];

const noteLengths = ['1n', '2n', '4n'];

const loopLengths = ['1m', '2m', '3m', '4m'];

let scheduledDemand = [5069.57, 4966.61, 5010.62, 4910.36, 4912.58, 4877.72, 4884.68, 4810.81, 4786.57, 4795.21, 4711.05, 4720.6, 4710.37, 4670.86, 4638.37, 4596.97, 4584.88, 4530.99, 4501.85, 4495.45, 4479.06, 4471.13, 4410.78, 4415.32, 4381.06, 4375.85, 4369.16, 4364.73, 4313.35, 4278.52, 4272.44, 4268.47, 4256.55, 4167.02, 4199.97, 4153.89, 4169.95, 4168.09, 4173.39, 4186.03, 4167.88, 4171.96, 4190.45, 4174.47, 4178.08, 4204.23, 4202.19, 4197.59, 4221.54, 4238.45, 4234.15, 4256, 4250.69, 4262.57, 4256.53, 4264.05, 4258.45, 4258.75, 4295.52, 4329.38, 4350.59, 4404.99, 4414.94, 4408.35, 4431.64, 4492.29, 4475.57, 4543.52, 4569.19, 4582.78, 4635.43, 4655.68, 4746.43, 4783.32, 4895.05, 4931.96, 5015.15, 5051.26, 5155.55, 5262.04, 5302.79, 5417.64, 5487.72, 5572.36, 5674.98, 5691.49, 5746.29, 5853.76, 5960.18, 6067.59, 6052.18, 6183.28, 6249.52, 6236.41, 6249.93, 6342.86, 6372.56, 6422.76, 6491.19, 6518.87, 6484.37, 6505.2, 6454.9, 6456.5, 6443.82, 6430.84, 6450.94, 6464.66, 6466.81, 6431.49, 6453.51, 6388.65, 6402.12, 6331.14, 6332.82, 6316.5, 6263.2, 6207.8, 6214.88, 6223.37, 6162.58, 6153.79, 6103.58, 6055.6, 6047.73, 6012, 5964.87, 5955.23, 5915.52, 5909.77, 5839.73, 5837.47, 5842.39, 5790.73, 5770.82, 5735.76, 5717.09, 5723.83, 5701.85, 5717.47, 5679.92, 5651.68, 5651.87, 5624.67, 5565.99, 5562.91, 5515.08, 5522.18, 5479.28, 5467.19, 5448.23, 5434.77, 5442.12, 5431.44, 5397.13, 5410.03, 5389.34, 5414.14, 5427.71, 5367.14, 5392.54, 5387.41, 5354.8, 5301.08, 5336.03, 5305.03, 5283.33, 5256.78, 5247.5, 5211.02, 5241.35, 5275.33, 5260.97, 5244.39, 5245.68, 5309.95, 5297.19, 5320.2, 5339.59, 5361.87, 5352.75, 5354.76, 5367.1, 5356.82, 5366, 5415.05, 5471.49, 5544.96, 5572.88, 5616.89, 5689.73, 5691.82, 5764.08, 5781.91, 5832.99, 5856.02, 5873.94, 5941.14, 5963.66, 6000.7, 6102.04, 6140.26, 6169.91, 6250.58, 6313.57, 6283.38, 6406.39, 6475.61, 6531.96, 6625.17, 6656.11, 6717.29, 6787.35, 6866.95, 6878.78, 6869.75, 6816.61, 6804.04, 6759.31, 6746.64, 6752.92, 6703.23, 6712.06, 6731.62, 6628.71, 6615.42, 6592.08, 6508.81, 6515.68, 6513.05, 6512.67, 6504.45, 6498.53, 6395.24, 6373.48, 6370.92, 6323.8, 6290.07, 6328.77, 6265.95, 6248.87, 6265.19, 6315.51, 6230, 6154.38, 6148.39, 6063.06, 6068.37, 6006.46, 6003.03, 5922.46, 5913.56, 5894.51, 5929.88, 5906.41, 5832.01, 5780.76, 5761.76, 5702.43, 5723.43, 5675.93, 5576.32, 5608.71, 5483.53, 5453.36, 5395.6, 5329.47, 5355.88, 5319.37, 5286.75, 5275.18, 5274.45, 5278.91, 5274.14, 5256.22, 5157.6, 5157.17, 5202.54, 5302.93, 5335.33, 5334.01, 5345.55, 5353.99, 5362.15, 5299.36, 5265.07, 5231.13, 5200.12];

let spotPrice = [65.4, 71.91655, 72.91143, 70.11507, 67.21987, 61.99, 59.88165, 61.99, 61.99, 61.99, 47.3391, 57.85, 43.34882, 47.04326, 48.53833, 47.87901, 47.87757, 47.80231, 47.13924, 53.73673, 65.4, 65.4, 59.1453, 61.99, 54.22025, 47.36903, 66.18238, 65.4, 63.63703, 65.4, 67.40555, 65.4, 65.4, 52.00938, 61.99, 51.89461, 51.86131, 57.85, 58.56811, 57.85, 57.85, 57.85, 57.85, 56.46012, 57.85, 61.55084, 61.99, 57.85, 57.85, 52.7837, 61.99, 61.99, 57.85, 61.46829, 57.85, 57.85, 57.85, 57.85, 61.23337, 57.85, 57.85, 35.50242, 61.99, 61.99, 54.54906, 63.44623, 72.13433, 42, 48.81309, 48.90573, 61.99, 61.99, 33.29487, 26.74701, 37.37564, 51.19439, 63.00276, 65.4, 74.5927, 72.63885, 73.8775, 80.36487, 108.17539, 107.62885, 112.80457, 78.16669, 61.99, 65.4, 80.97224, 75.97492, 79.5911, 369.57774, 290.99, 88.58902, 54.58284, 65.4, 49.71419, 281.39233, 299.5, 376.31754, 274.12961, 274.50658, 94.0505, 272.24617, 272.49156, 270.67085, 267.64313, 268.21892, 237.43579, 270.68538, 271.16096, 200.27766, 151.67554, 106.35857, 98.24392, 145, 114.93026, 161.43844, 110.69184, 158.02641, 109.4583, 93.61134, 78.99046, 73.43515, 64.42641, 65.4, 61.83, 59.93857, 77.15001, 65.4, 59.27815, 59.023, 58.78818, 57.99238, 45.12168, 44.36655, 42, 42, 42, 43.97303, 42, 44.96696, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 56.02098, 42, 42, 43.09229, 46.79967, 61.99, 61.99, 61.99, 61.99, 69.12521, 61.99, 61.99, 61.99, 65.4, 70.56937, 62.05025, 63.47291, 102.56047, 102.59855, 102.67261, 102.57274, 102.16861, 101.44285, 65.4, 90.76679, 94.35983, 81.36147, 94.35918, 94.54803, 56.16056, 60.95414, 65.4, 83.92722, 99.13784, 99.73924, 101.14462, 221.48944, 199.71766, 262.96022, 192.73275, 234.69442, 71.16849, 79.99115, 61.99, 81.22276, 145, 258.51419, 61.52786, 68.44456, 58.70167, 59.23548, 74.68139, 4050.58688, -849.97184, 34.79974, 46.02417, 35.45137, 36.27625, 244.0146, 39.27004, 80.20676, 151.49624, 197.50049, 87.21802, 72.11482, 62.01012, 72.30935, 67, 67.26368, 59.2118, 92.00591, 234.82649, 82.84172, 72.2325, 50.1273, 12.72098, 12.55128, 32.19171, 67, 59.92294, 67, 72.27408, 57.70506, 78.61006, 78.1995, 79.41523, 83.89, 83.1754, 77.78098, 105.37325, 87.31718, 95.06, 83.15278, 83.55995, 30.52669, 95.06, 0.00012, 12.56438, 12.47865, 17.34552, 12.16068, 236.2008, 78.91724, 24.68614, 12.0067, 12.0067, 0.00013, 92.84198, 59.28278, 30.68364, 51.32237, 20.48, 29.43092, 96.28054, 254.28434, 256.74185, 251.41665, 82.91617, 81.60024, 255.78683, 120, 145, 120, 75.60257, 72.55975, 120, 85.47923, 85.75499, 79.42266, 78.95843, 83.89, 290.99, 120.98236, 94.79748, 75.19267, 68.64488];

let totalGeneration = [6019.71, 5964.25, 5941.1, 5947.18, 5941.12, 5712.51, 5689.97, 5724.68, 5622.31, 5676.37, 5589.49, 5635.01, 5638.8, 5613.85, 5520.87, 5464.38, 5445.61, 5407.72, 5406.56, 5391.27, 5555.21, 5507.11, 5446.54, 5450.5, 5369.16, 5352.04, 5385.64, 5365.16, 5304.68, 5314.2, 5348.95, 5322.53, 5369.25, 5239.54, 5226.82, 5239.71, 5223.76, 5217.93, 5235.51, 5236.84, 5212.77, 5221.17, 5200.89, 5157.33, 5242.61, 5270.99, 5274.02, 5279.68, 5310.15, 5280.71, 5316.28, 5419.89, 5390.49, 5503.68, 5355.06, 5384.5, 5406.1, 5388.29, 5485.75, 5518.73, 5577.9, 5501.58, 5631.93, 5649.05, 5694.67, 5683.26, 5710.72, 5676.74, 5749.53, 5705.89, 5890.42, 5919.49, 6015.21, 5868.3, 6054.21, 6030.94, 6038.89, 6069.9, 6105.3, 6358.13, 6391.41, 6398.95, 6396.19, 6427.27, 6429.47, 6502.21, 6329.13, 6409.54, 6461.84, 6490.37, 6524.7, 6748.71, 6647.44, 6535.25, 6456.41, 6471.87, 6396.09, 6586.51, 6728.59, 6778.14, 6631.8, 6639.51, 6554.08, 6654.4, 6664.78, 6700.97, 6712.6, 6738.21, 6748.76, 6594.16, 6599.24, 6598.98, 6590.65, 6499.15, 6481.08, 6448.35, 6419.48, 6470.96, 6420.05, 6476.96, 6421.69, 6409.42, 6419.22, 6422.99, 6353.9, 6332.03, 6287.5, 6208.47, 6196.94, 6200.03, 6132.08, 6130.62, 6144.72, 6155.24, 6173.51, 6175.46, 5976.15, 5950.88, 5807.78, 5866.15, 5808.85, 5838.05, 5704.52, 5799.99, 5586.15, 5653.93, 5552.06, 5754.64, 5636.9, 5596.43, 5742.17, 5751.18, 5847.5, 5826.3, 5709.42, 5845.87, 5846.47, 5824.12, 5986.25, 5883.64, 5840.3, 6015.08, 5711.69, 5841.49, 5831.23, 5878.49, 5928.24, 5833.81, 5776.72, 5640.19, 5659.28, 5679.38, 5690.56, 5711.08, 5758.82, 6007.76, 6048.39, 6046.17, 6074.58, 6073.85, 6101.42, 6023.52, 5964.74, 6040.39, 6126.78, 6153.96, 6155.1, 6191.25, 6256.14, 6268.02, 6266.51, 6311.61, 6354.1, 6316.01, 6337.16, 6290.38, 6387.84, 6416.53, 6427.55, 6474.67, 6580.32, 6833.63, 6818.33, 6792.4, 6828.93, 6912.05, 7014.82, 7078.24, 7094.32, 7115.99, 7255.37, 7311.43, 7460.51, 7512.19, 7511.02, 7509.17, 7508.31, 7459.8, 7352.81, 7339.4, 7372.77, 7329.47, 7365.52, 7380.28, 7376.84, 7391.14, 7495.96, 7490.3, 7498.29, 7503.27, 7512.25, 7500.73, 7368.71, 7309.41, 7226.97, 7194.87, 7157.06, 7142.86, 7140.59, 7113.06, 7114.8, 7102.72, 7033.21, 7118.9, 7027.92, 6996.34, 6913.53, 6920.88, 6746.3, 6679.16, 6589.86, 6520.23, 6479.14, 6604.03, 6620.89, 6608.99, 6553.57, 6461.58, 6427.75, 6461.16, 6447.43, 6447.7, 6452.12, 6382.56, 6419.85, 6143.19, 6025.1, 5921.36, 5928.16, 5986.98, 6065.11, 5858.35, 5896.89, 5911.25, 5809.63, 5712.48, 5727.8, 5674.33, 5642.13, 5633.83, 5591.44, 5548.62, 5519.66, 5393.36, 5370.61, 5400.77, 5423.01, 5437.21];

let coalGeneration = [3712.18, 3712.18, 3712.18, 3712.18, 3712.18, 3712.18, 3712.18, 3712.18, 3712.18, 3712.18, 3712.18, 3712.18, 3627.492, 3627.492, 3627.492, 3627.492, 3627.492, 3627.492, 3627.492, 3627.492, 3627.492, 3627.492, 3627.492, 3627.492, 3443.511, 3443.511, 3443.511, 3443.511, 3443.511, 3443.511, 3443.511, 3443.511, 3443.511, 3443.511, 3443.511, 3443.511, 3242.389, 3242.389, 3242.389, 3242.389, 3242.389, 3242.389, 3242.389, 3242.389, 3242.389, 3242.389, 3242.389, 3242.389, 3301.597, 3301.597, 3301.597, 3301.597, 3301.597, 3301.597, 3301.597, 3301.597, 3301.597, 3301.597, 3301.597, 3301.597, 3361.227, 3361.227, 3361.227, 3361.227, 3361.227, 3361.227, 3361.227, 3361.227, 3361.227, 3361.227, 3361.227, 3361.227, 3560.526, 3560.526, 3560.526, 3560.526, 3560.526, 3560.526, 3560.526, 3560.526, 3560.526, 3560.526, 3560.526, 3560.526, 3931.301, 3931.301, 3931.301, 3931.301, 3931.301, 3931.301, 3931.301, 3931.301, 3931.301, 3931.301, 3931.301, 3931.301, 4161.219, 4161.219, 4161.219, 4161.219, 4161.219, 4161.219, 4161.219, 4161.219, 4161.219, 4161.219, 4161.219, 4161.219, 4153.982, 4153.982, 4153.982, 4153.982, 4153.982, 4153.982, 4153.982, 4153.982, 4153.982, 4153.982, 4153.982, 4153.982, 4198.801, 4198.801, 4198.801, 4198.801, 4198.801, 4198.801, 4198.801, 4198.801, 4198.801, 4198.801, 4198.801, 4198.801, 4110.154, 4110.154, 4110.154, 4110.154, 4110.154, 4110.154, 4110.154, 4110.154, 4110.154, 4110.154, 4110.154, 4110.154, 4217.545, 4217.545, 4217.545, 4217.545, 4217.545, 4217.545, 4217.545, 4217.545, 4217.545, 4217.545, 4217.545, 4217.545, 4329.827, 4329.827, 4329.827, 4329.827, 4329.827, 4329.827, 4329.827, 4329.827, 4329.827, 4329.827, 4329.827, 4329.827, 4210.432, 4210.432, 4210.432, 4210.432, 4210.432, 4210.432, 4210.432, 4210.432, 4210.432, 4210.432, 4210.432, 4210.432, 4218.998, 4218.998, 4218.998, 4218.998, 4218.998, 4218.998, 4218.998, 4218.998, 4218.998, 4218.998, 4218.998, 4218.998, 4421.419, 4421.419, 4421.419, 4421.419, 4421.419, 4421.419, 4421.419, 4421.419, 4421.419, 4421.419, 4421.419, 4421.419, 4569.935, 4569.935, 4569.935, 4569.935, 4569.935, 4569.935, 4569.935, 4569.935, 4569.935, 4569.935, 4569.935, 4569.935, 4362.488, 4362.488, 4362.488, 4362.488, 4362.488, 4362.488, 4362.488, 4362.488, 4362.488, 4362.488, 4362.488, 4362.488, 4617.708, 4617.708, 4617.708, 4617.708, 4617.708, 4617.708, 4617.708, 4617.708, 4617.708, 4617.708, 4617.708, 4617.708, 4697.897, 4697.897, 4697.897, 4697.897, 4697.897, 4697.897, 4697.897, 4697.897, 4697.897, 4697.897, 4697.897, 4697.897, 4721.699, 4721.699, 4721.699, 4721.699, 4721.699, 4721.699, 4721.699, 4721.699, 4721.699, 4721.699, 4721.699, 4721.699, 4704.58, 4704.58, 4704.58, 4704.58, 4704.58, 4704.58, 4704.58, 4704.58, 4704.58, 4704.58, 4704.58, 4704.58, 4698.05, 4698.05, 4698.05, 4698.05, 4698.05, 4698.05, 4698.05, 4698.05, 4698.05, 4698.05, 4698.05, 4698.05];

let hydroGeneration = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 85.658, 85.658, 85.658, 85.658, 85.658, 85.658, 85.658, 85.658, 85.658, 85.658, 85.658, 85.658, 190.388, 190.388, 190.388, 190.388, 190.388, 190.388, 190.388, 190.388, 190.388, 190.388, 190.388, 190.388, 534.278, 534.278, 534.278, 534.278, 534.278, 534.278, 534.278, 534.278, 534.278, 534.278, 534.278, 534.278, 423.046, 423.046, 423.046, 423.046, 423.046, 423.046, 423.046, 423.046, 423.046, 423.046, 423.046, 423.046, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 422.993, 422.993, 422.993, 422.993, 422.993, 422.993, 422.993, 422.993, 422.993, 422.993, 422.993, 422.993, 1112.016, 1112.016, 1112.016, 1112.016, 1112.016, 1112.016, 1112.016, 1112.016, 1112.016, 1112.016, 1112.016, 1112.016, 978.883, 978.883, 978.883, 978.883, 978.883, 978.883, 978.883, 978.883, 978.883, 978.883, 978.883, 978.883, 952.714, 952.714, 952.714, 952.714, 952.714, 952.714, 952.714, 952.714, 952.714, 952.714, 952.714, 952.714, 859.362, 859.362, 859.362, 859.362, 859.362, 859.362, 859.362, 859.362, 859.362, 859.362, 859.362, 859.362, 609.562, 609.562, 609.562, 609.562, 609.562, 609.562, 609.562, 609.562, 609.562, 609.562, 609.562, 609.562, 396.125, 396.125, 396.125, 396.125, 396.125, 396.125, 396.125, 396.125, 396.125, 396.125, 396.125, 396.125];

let gasGeneration = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.13, 0.13, 0.13, 0.13, 0.13, 0.13, 0.13, 0.13, 0.13, 0.13, 0.13, 0.13, 36.625, 36.625, 36.625, 36.625, 36.625, 36.625, 36.625, 36.625, 36.625, 36.625, 36.625, 36.625, 41.685, 41.685, 41.685, 41.685, 41.685, 41.685, 41.685, 41.685, 41.685, 41.685, 41.685, 41.685, 42.67, 42.67, 42.67, 42.67, 42.67, 42.67, 42.67, 42.67, 42.67, 42.67, 42.67, 42.67, 4.985, 4.985, 4.985, 4.985, 4.985, 4.985, 4.985, 4.985, 4.985, 4.985, 4.985, 4.985, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20.281, 20.281, 20.281, 20.281, 20.281, 20.281, 20.281, 20.281, 20.281, 20.281, 20.281, 20.281, 167.531, 167.531, 167.531, 167.531, 167.531, 167.531, 167.531, 167.531, 167.531, 167.531, 167.531, 167.531, 411.644, 411.644, 411.644, 411.644, 411.644, 411.644, 411.644, 411.644, 411.644, 411.644, 411.644, 411.644, 482.392, 482.392, 482.392, 482.392, 482.392, 482.392, 482.392, 482.392, 482.392, 482.392, 482.392, 482.392, 230.136, 230.136, 230.136, 230.136, 230.136, 230.136, 230.136, 230.136, 230.136, 230.136, 230.136, 230.136, 85.781, 85.781, 85.781, 85.781, 85.781, 85.781, 85.781, 85.781, 85.781, 85.781, 85.781, 85.781, 90.25, 90.25, 90.25, 90.25, 90.25, 90.25, 90.25, 90.25, 90.25, 90.25, 90.25, 90.25, 195.25, 195.25, 195.25, 195.25, 195.25, 195.25, 195.25, 195.25, 195.25, 195.25, 195.25, 195.25];

let windGeneration = [2258.457, 2258.457, 2258.457, 2258.457, 2258.457, 2258.457, 2258.457, 2258.457, 2258.457, 2258.457, 2258.457, 2258.457, 2277.99, 2277.99, 2277.99, 2277.99, 2277.99, 2277.99, 2277.99, 2277.99, 2277.99, 2277.99, 2277.99, 2277.99, 2273.649, 2273.649, 2273.649, 2273.649, 2273.649, 2273.649, 2273.649, 2273.649, 2273.649, 2273.649, 2273.649, 2273.649, 2255.823, 2255.823, 2255.823, 2255.823, 2255.823, 2255.823, 2255.823, 2255.823, 2255.823, 2255.823, 2255.823, 2255.823, 2226.951, 2226.951, 2226.951, 2226.951, 2226.951, 2226.951, 2226.951, 2226.951, 2226.951, 2226.951, 2226.951, 2226.951, 2169.171, 2169.171, 2169.171, 2169.171, 2169.171, 2169.171, 2169.171, 2169.171, 2169.171, 2169.171, 2169.171, 2169.171, 2132.177, 2132.177, 2132.177, 2132.177, 2132.177, 2132.177, 2132.177, 2132.177, 2132.177, 2132.177, 2132.177, 2132.177, 2248.505, 2248.505, 2248.505, 2248.505, 2248.505, 2248.505, 2248.505, 2248.505, 2248.505, 2248.505, 2248.505, 2248.505, 2294.428, 2294.428, 2294.428, 2294.428, 2294.428, 2294.428, 2294.428, 2294.428, 2294.428, 2294.428, 2294.428, 2294.428, 2286.178, 2286.178, 2286.178, 2286.178, 2286.178, 2286.178, 2286.178, 2286.178, 2286.178, 2286.178, 2286.178, 2286.178, 2281.225, 2281.225, 2281.225, 2281.225, 2281.225, 2281.225, 2281.225, 2281.225, 2281.225, 2281.225, 2281.225, 2281.225, 2210.512, 2210.512, 2210.512, 2210.512, 2210.512, 2210.512, 2210.512, 2210.512, 2210.512, 2210.512, 2210.512, 2210.512, 2121.839, 2121.839, 2121.839, 2121.839, 2121.839, 2121.839, 2121.839, 2121.839, 2121.839, 2121.839, 2121.839, 2121.839, 2132.839, 2132.839, 2132.839, 2132.839, 2132.839, 2132.839, 2132.839, 2132.839, 2132.839, 2132.839, 2132.839, 2132.839, 2138.493, 2138.493, 2138.493, 2138.493, 2138.493, 2138.493, 2138.493, 2138.493, 2138.493, 2138.493, 2138.493, 2138.493, 2185.736, 2185.736, 2185.736, 2185.736, 2185.736, 2185.736, 2185.736, 2185.736, 2185.736, 2185.736, 2185.736, 2185.736, 2174.467, 2174.467, 2174.467, 2174.467, 2174.467, 2174.467, 2174.467, 2174.467, 2174.467, 2174.467, 2174.467, 2174.467, 2249.969, 2249.969, 2249.969, 2249.969, 2249.969, 2249.969, 2249.969, 2249.969, 2249.969, 2249.969, 2249.969, 2249.969, 2034.804, 2034.804, 2034.804, 2034.804, 2034.804, 2034.804, 2034.804, 2034.804, 2034.804, 2034.804, 2034.804, 2034.804, 1842.826, 1842.826, 1842.826, 1842.826, 1842.826, 1842.826, 1842.826, 1842.826, 1842.826, 1842.826, 1842.826, 1842.826, 1665.6, 1665.6, 1665.6, 1665.6, 1665.6, 1665.6, 1665.6, 1665.6, 1665.6, 1665.6, 1665.6, 1665.6, 1499.159, 1499.159, 1499.159, 1499.159, 1499.159, 1499.159, 1499.159, 1499.159, 1499.159, 1499.159, 1499.159, 1499.159, 1221.331, 1221.331, 1221.331, 1221.331, 1221.331, 1221.331, 1221.331, 1221.331, 1221.331, 1221.331, 1221.331, 1221.331, 1052.956, 1052.956, 1052.956, 1052.956, 1052.956, 1052.956, 1052.956, 1052.956, 1052.956, 1052.956, 1052.956, 1052.956];

let solarGeneration = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1.407, 1.407, 1.407, 1.407, 1.407, 1.407, 1.407, 1.407, 1.407, 1.407, 1.407, 1.407, 31.091, 31.091, 31.091, 31.091, 31.091, 31.091, 31.091, 31.091, 31.091, 31.091, 31.091, 31.091, 123.264, 123.264, 123.264, 123.264, 123.264, 123.264, 123.264, 123.264, 123.264, 123.264, 123.264, 123.264, 226.656, 226.656, 226.656, 226.656, 226.656, 226.656, 226.656, 226.656, 226.656, 226.656, 226.656, 226.656, 336.595, 336.595, 336.595, 336.595, 336.595, 336.595, 336.595, 336.595, 336.595, 336.595, 336.595, 336.595, 335.121, 335.121, 335.121, 335.121, 335.121, 335.121, 335.121, 335.121, 335.121, 335.121, 335.121, 335.121, 371.543, 371.543, 371.543, 371.543, 371.543, 371.543, 371.543, 371.543, 371.543, 371.543, 371.543, 371.543, 347.15, 347.15, 347.15, 347.15, 347.15, 347.15, 347.15, 347.15, 347.15, 347.15, 347.15, 347.15, 207.454, 207.454, 207.454, 207.454, 207.454, 207.454, 207.454, 207.454, 207.454, 207.454, 207.454, 207.454, 62.943, 62.943, 62.943, 62.943, 62.943, 62.943, 62.943, 62.943, 62.943, 62.943, 62.943, 62.943, 1.202, 1.202, 1.202, 1.202, 1.202, 1.202, 1.202, 1.202, 1.202, 1.202, 1.202, 1.202, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

let batteryGeneration = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1.013, 1.013, 1.013, 1.013, 1.013, 1.013, 1.013, 1.013, 1.013, 1.013, 1.013, 1.013, 3.883, 3.883, 3.883, 3.883, 3.883, 3.883, 3.883, 3.883, 3.883, 3.883, 3.883, 3.883, 2.596, 2.596, 2.596, 2.596, 2.596, 2.596, 2.596, 2.596, 2.596, 2.596, 2.596, 2.596, 6.733, 6.733, 6.733, 6.733, 6.733, 6.733, 6.733, 6.733, 6.733, 6.733, 6.733, 6.733, 1.772, 1.772, 1.772, 1.772, 1.772, 1.772, 1.772, 1.772, 1.772, 1.772, 1.772, 1.772, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1.173, 1.173, 1.173, 1.173, 1.173, 1.173, 1.173, 1.173, 1.173, 1.173, 1.173, 1.173, 6.191, 6.191, 6.191, 6.191, 6.191, 6.191, 6.191, 6.191, 6.191, 6.191, 6.191, 6.191, 6.291, 6.291, 6.291, 6.291, 6.291, 6.291, 6.291, 6.291, 6.291, 6.291, 6.291, 6.291, 14.783, 14.783, 14.783, 14.783, 14.783, 14.783, 14.783, 14.783, 14.783, 14.783, 14.783, 14.783, 20.001, 20.001, 20.001, 20.001, 20.001, 20.001, 20.001, 20.001, 20.001, 20.001, 20.001, 20.001, 5.243, 5.243, 5.243, 5.243, 5.243, 5.243, 5.243, 5.243, 5.243, 5.243, 5.243, 5.243, 0.278, 0.278, 0.278, 0.278, 0.278, 0.278, 0.278, 0.278, 0.278, 0.278, 0.278, 0.278, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4.859, 4.859, 4.859, 4.859, 4.859, 4.859, 4.859, 4.859, 4.859, 4.859, 4.859, 4.859];