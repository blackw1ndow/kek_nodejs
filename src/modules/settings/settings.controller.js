const { StatusCodes } = require('http-status-codes');
const { settingsService } = require('./settings.service');

class SettingsController {
  constructor(service = settingsService) {
    this.service = service;
  }

  list = async (_req, res) => {
    res.status(StatusCodes.OK).json({ settings: this.service.getAll() });
  };

  getOne = async (req, res) => {
    const { key } = req.params;
    res.status(StatusCodes.OK).json({ key, value: this.service.get(key) });
  };

  update = async (req, res) => {
    const result = await this.service.set(req.params.key, req.body.value);
    res.status(StatusCodes.OK).json(result);
  };

  reload = async (_req, res) => {
    const settings = await this.service.refresh();
    res.status(StatusCodes.OK).json({ settings });
  };
}

const settingsController = new SettingsController();

module.exports = { SettingsController, settingsController };
