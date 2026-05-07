"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RoutingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const risk_engine_service_1 = require("../risk-engine/risk-engine.service");
const traffic_engine_service_1 = require("../risk-engine/traffic-engine.service");
let RoutingService = RoutingService_1 = class RoutingService {
    constructor(httpService, configService, riskEngine, trafficEngine) {
        this.httpService = httpService;
        this.configService = configService;
        this.riskEngine = riskEngine;
        this.trafficEngine = trafficEngine;
        this.logger = new common_1.Logger(RoutingService_1.name);
        this.valhallaUrl = this.configService.get('VALHALLA_URL', 'http://valhalla:8002');
    }
    async getSpeedLimit(lat, lng) {
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(`${this.valhallaUrl}/trace_attributes`, {
                params: {
                    json: JSON.stringify({
                        shape: [{ lat, lon: lng }],
                        costing: 'auto',
                        shape_match: 'map_snap',
                        filters: {
                            attributes: ['edge.speed_limit'],
                            action: 'include',
                        },
                    }),
                },
            }));
            return response.data.edges?.[0]?.speed_limit || 60;
        }
        catch (error) {
            this.logger.warn(`Speed limit lookup failed at ${lat},${lng}: ${error.message}`);
            return 60;
        }
    }
    async calculateOptimalRoute(origin, destination, vehicleType, waypoints) {
        try {
            const locations = [
                { lat: origin.lat, lon: origin.lng },
                ...(waypoints?.map(w => ({ lat: w.lat, lon: w.lng })) || []),
                { lat: destination.lat, lon: destination.lng }
            ];
            const costing = this.mapVehicleToCosting(vehicleType);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.valhallaUrl}/route`, {
                params: {
                    json: JSON.stringify({
                        locations,
                        costing,
                        units: 'kilometers',
                        alternates: 2,
                        filters: {
                            attributes: [
                                'edge.speed_limit',
                                'edge.name',
                                'edge.length',
                                'edge.weighted_grade',
                            ],
                        },
                    }),
                },
            }));
            const valhallaRoute = response.data.trip;
            const alternateTrips = response.data.alternates || [];
            const baseTime = valhallaRoute.summary.time;
            const distance = valhallaRoute.summary.length;
            const maxRisk = this.evaluatePathRisk(origin, destination, vehicleType);
            const { shape, routeCoordinates, maneuvers, totalTrafficDurationSec } = this.buildRouteGeometryAndManeuvers(valhallaRoute.legs || []);
            const estimatedTimeSeconds = totalTrafficDurationSec > 0
                ? totalTrafficDurationSec
                : baseTime;
            const alternatives = [
                this.routeOptionFromTrip(valhallaRoute, 'Best route', maxRisk),
                ...alternateTrips.map((alternate, index) => this.routeOptionFromTrip(alternate.trip || alternate, `Alternative ${index + 1}`, maxRisk)),
            ].filter((route) => route.routeCoordinates.length > 0);
            return {
                id: `route_${Date.now()}`,
                distanceMeters: distance * 1000,
                estimatedTimeSeconds: baseTime,
                polyline: shape,
                routeCoordinates,
                maneuvers,
                safetyRiskScore: maxRisk,
                riskLevel: this.riskEngine.getRiskLevel(maxRisk),
                summary: valhallaRoute.summary,
                alternatives,
            };
        }
        catch (error) {
            this.logger.error(`Routing error: ${error.message}`);
            return this.getFallbackRoute(origin, destination);
        }
    }
    mapVehicleToCosting(type) {
        switch (type) {
            case risk_engine_service_1.VehicleType.CAR:
                return 'auto';
            case risk_engine_service_1.VehicleType.WALKING:
                return 'pedestrian';
            case risk_engine_service_1.VehicleType.CYCLING:
                return 'bicycle';
            case risk_engine_service_1.VehicleType.TRANSIT:
                return 'transit';
            case risk_engine_service_1.VehicleType.MOTO:
                return 'motorcycle';
            default:
                return 'auto';
        }
    }
    evaluatePathRisk(origin, dest, vehicle) {
        return Math.random() * 0.5;
    }
    getFallbackRoute(origin, dest) {
        return {
            id: 'fallback_route',
            distanceMeters: 5000,
            estimatedTimeSeconds: 600,
            polyline: '',
            routeCoordinates: [origin, dest],
            maneuvers: [
                {
                    instruction: 'Follow the route to your destination',
                    verbalInstruction: 'Follow the route to your destination',
                    maneuver: 'straight',
                    distanceMeters: 5000,
                    durationSeconds: 600,
                    beginShapeIndex: 0,
                    endShapeIndex: 1,
                    startLocation: origin,
                    endLocation: dest,
                    streetNames: [],
                },
            ],
            safetyRiskScore: 0.1,
            riskLevel: 'LOW',
            alternatives: [
                {
                    id: 'fallback_route',
                    label: 'Fallback route',
                    distanceMeters: 5000,
                    estimatedTimeSeconds: 600,
                    routeCoordinates: [origin, dest],
                    maneuvers: [],
                    safetyRiskScore: 0.1,
                    riskLevel: 'LOW',
                },
            ],
        };
    }
    routeOptionFromTrip(trip, label, riskScore) {
        const { shape, routeCoordinates, maneuvers } = this.buildRouteGeometryAndManeuvers(trip.legs || []);
        const summary = trip.summary || {};
        const distanceMeters = Math.round((summary.length || 0) * 1000);
        const estimatedTimeSeconds = Math.round(summary.time || 0);
        return {
            id: `${label.toLowerCase().replace(/\s+/g, '_')}_${distanceMeters}_${estimatedTimeSeconds}`,
            label,
            distanceMeters,
            estimatedTimeSeconds,
            polyline: shape,
            routeCoordinates,
            maneuvers,
            safetyRiskScore: riskScore,
            riskLevel: this.riskEngine.getRiskLevel(riskScore),
            summary,
        };
    }
    buildRouteGeometryAndManeuvers(legs) {
        const routeCoordinates = [];
        const maneuvers = [];
        const shapes = [];
        let totalTrafficDurationSec = 0;
        for (const leg of legs) {
            const legShape = leg.shape || '';
            const legPoints = this.decodePolyline6(legShape);
            const offset = routeCoordinates.length;
            shapes.push(legShape);
            routeCoordinates.push(...legPoints);
            for (const maneuver of leg.maneuvers || []) {
                const beginShapeIndex = offset + (maneuver.begin_shape_index || 0);
                const endShapeIndex = offset + (maneuver.end_shape_index || maneuver.begin_shape_index || 0);
                const startLocation = routeCoordinates[beginShapeIndex] || legPoints[0];
                const endLocation = routeCoordinates[endShapeIndex] ||
                    legPoints[legPoints.length - 1] ||
                    startLocation;
                const segmentId = this.trafficEngine.segmentIdForLocation(startLocation.lat, startLocation.lng);
                const trafficLevel = this.trafficEngine.getTrafficLevelAt(startLocation.lat, startLocation.lng);
                const baseDuration = Math.round(maneuver.time || 0);
                const adjustedDuration = this.trafficEngine.getDynamicRouteWeight(segmentId, baseDuration);
                maneuvers.push({
                    instruction: maneuver.instruction ||
                        maneuver.verbal_pre_transition_instruction ||
                        'Continue',
                    verbalInstruction: maneuver.verbal_pre_transition_instruction ||
                        maneuver.instruction ||
                        'Continue',
                    maneuver: this.mapValhallaManeuverType(maneuver.type),
                    distanceMeters: Math.round((maneuver.length || 0) * 1000),
                    durationSeconds: adjustedDuration,
                    trafficLevel,
                    beginShapeIndex,
                    endShapeIndex,
                    startLocation,
                    endLocation,
                    streetNames: maneuver.street_names || [],
                    lanes: maneuver.lanes || [],
                });
                totalTrafficDurationSec += adjustedDuration;
            }
        }
        return {
            shape: shapes[0] || '',
            routeCoordinates,
            maneuvers,
            totalTrafficDurationSec,
        };
    }
    mapValhallaManeuverType(type) {
        const maneuverTypes = {
            1: 'start',
            2: 'start-right',
            3: 'start-left',
            4: 'destination',
            5: 'destination-right',
            6: 'destination-left',
            7: 'continue',
            8: 'slight-right',
            9: 'right',
            10: 'sharp-right',
            11: 'u-turn-right',
            12: 'u-turn-left',
            13: 'sharp-left',
            14: 'left',
            15: 'slight-left',
            16: 'ramp-straight',
            17: 'ramp-right',
            18: 'ramp-left',
            19: 'exit-right',
            20: 'exit-left',
            21: 'stay-straight',
            22: 'stay-right',
            23: 'stay-left',
            24: 'merge',
            25: 'roundabout-enter',
            26: 'roundabout-exit',
            27: 'ferry-enter',
            28: 'ferry-exit',
            29: 'transit',
            30: 'transit-transfer',
            31: 'transit-remain-on',
            32: 'transit-connection-start',
            33: 'transit-connection-transfer',
            34: 'transit-connection-destination',
            35: 'post-transit-connection-destination',
            36: 'merge-right',
            37: 'merge-left',
        };
        return maneuverTypes[type] || 'continue';
    }
    decodePolyline6(encoded) {
        const points = [];
        let idx = 0, lat = 0, lng = 0;
        while (idx < encoded.length) {
            let b, shift = 0, result = 0;
            do {
                b = encoded.charCodeAt(idx++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(idx++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
            points.push({ lat: lat / 1e6, lng: lng / 1e6 });
        }
        return points;
    }
};
exports.RoutingService = RoutingService;
exports.RoutingService = RoutingService = RoutingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService,
        risk_engine_service_1.RiskEngineService,
        traffic_engine_service_1.TrafficEngineService])
], RoutingService);
//# sourceMappingURL=routing.service.js.map